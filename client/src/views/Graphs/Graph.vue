<template>
  <div class="view-container">
    <left-side-panel
      class="left-side-panel"
      :activeTabId="activeTabId"
      :tabs="tabs"
      @tab-click="onTabClick"
    >
      <metadata-panel v-if="activeTabId === 'metadata'" slot="content" :metadata="selectedGraph && selectedGraph.metadata"/>
      <facets-pane v-else-if="activeTabId === 'facets'" slot="content" />
    </left-side-panel>
    <div class="d-flex flex-column flex-grow-1 position-relative">
      <div class="search-row">
        <search-bar :placeholder="`Search for model components...`" />
        <button v-if="canOpenLocalView" class="btn btn-primary m-1" @click="onSplitView">
          <font-awesome-icon :icon="['fas', getIcon ]" />
          <span>{{ getMessage }}</span>
        </button>
      </div>
      <resizable-grid :map="gridMap" :dimensions="gridDimensions">
        <div slot="1" class="h-100 w-100 d-flex flex-column">
          <settings-bar>
            <div slot="left">
              <counters
                :title="selectedGraph && selectedGraph.metadata.name"
                :data="countersData"
              />
            </div>
            <div slot="settings">
              <!-- <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/> -->
            </div>
          </settings-bar>
          <grafer class="grafer" @loaded="mainGraphLoading = false" @grafer_click="onGraferClick"></grafer>
        </div>
        <div slot="2" class="h-100 w-100 d-flex flex-column">
          <settings-bar>
            <div slot="right">
              <counters
                :title="`Subgraph`"
                :data="[
                  { name: 'Nodes', value: subgraphNodeCount },
                  { name: 'Edges', value: subgraphEdgeCount },
                ]"
              />
            </div>
            <div slot="right">
              <!-- <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/> -->
            </div>
          </settings-bar>
          <loader :loading="subgraphLoading" />
          <local-graph v-if="subgraph"
                      :data="subgraph"
                      @node-click="onNodeClick"
                      @edge-click="onEdgeClick"
                      @background-click ="onBackgroundClick"
                      @loaded="subgraphLoading = false"/>
          <div v-if="showMessageTooLarge" class="alert alert-info mr-2" role="alert">
            Results are too large. Keep adding filters to reduce the size.
          </div>
          <div v-if="showMessageEmpty" class="alert alert-info mr-2" role="alert">
            Results are empty. Try another query.
          </div>
        </div>
      </resizable-grid>
    </div>
    <drilldown-panel @close-pane="onCloseDrilldownPanel" :is-open="isOpenDrilldown">
      <node-pane
        v-if="drilldownActivePaneId === 'node'"
        slot="content"
        :model="selectedGraphId"
        :data="drilldownMetadata"
        @add-to-subgraph="onAddToSubgraph"
      />
      <edge-pane
        v-if="drilldownActivePaneId === 'edge'"
        slot="content"
        :model="selectedGraphId"
        :data="drilldownMetadata"
        @evidence-click="onEvidenceClick"
      />
    </drilldown-panel>

    <modal-document
      v-if="showModalDocument"
      link-to-knowledge-space="true"
      :artifact="modalDocumentArtifact"
      @close="showModalDocument = false"
    />
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Action, Getter, Mutation } from 'vuex-class';
  import { Watch } from 'vue-property-decorator';

  import { bgraph } from '@uncharted.software/bgraph';
  import { GraferNodesData, GraferEdgesData, GraferLabelsData } from '@uncharted.software/grafer';

  import { Counter, TabInterface, GraferEventDetail } from '@/types/types';
  import { GraphInterface, GraphNodeInterface, GraphEdgeInterface } from '@/types/typesGraphs';
  import { BioGraferLayerDataPayloadInterface } from '@/types/typesGrafer';
  import { CosmosArtifactInterface } from '@/types/typesCosmos';
  import { FILTRES_FIELDS } from '@/types/typesFiltres';
  import * as KnowledgeGraph from '@/types/typesKnowledgeGraph';
  import eventHub from '@/eventHub';

  import {
    deepCopy, // TODO: Deep copy should be moved into it's own general utility file
    loadBGraphData,
    filterToBgraph,
    formatBGraphOutputToLocalGraph,
    formatBGraphOutputToGraferLayers,
    getBGraphAggregatesFromFiltres,
  } from '@/utils/BGraphUtil';
  import { isEmpty } from '@/utils/FiltersUtil';
  import { loadJSONLFile } from '@/utils/FileLoaderUtil';
  import { BIO_CLUSTER_LAYERS_EDGE_OPTIONS, BIO_CLUSTER_LAYERS_LABEL_OPTIONS, BIO_NODE_LAYERS_EDGE_OPTIONS, BIO_NODE_LAYERS_NODE_OPTIONS } from '@/utils/GraferUtil';
  import { getS3Util } from '@/utils/FetchUtil';

  import { cosmosArtifactsMem } from '@/services/CosmosFetchService';

  import Counters from '@/components/Counters.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import Loader from '@/components/widgets/Loader.vue';
  import ModalDocument from '@/components/Modals/ModalDocument.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import SettingsBar from '@/components/SettingsBar.vue';

  import FacetsPane from '@/views/Graphs/components/FacetsPane.vue';
  import MetadataPanel from '@/views/Graphs/components/MetadataPanel.vue';
  import SearchBar from '@/views/Graphs/components/SearchBar.vue';
  import Settings from '@/views/Graphs/components/Settings.vue';

  import EdgePane from '@/views/Graphs/components/DrilldownPanel/EdgePane.vue';
  import NodePane from '@/views/Graphs/components/DrilldownPanel/NodePane.vue';
  import Grafer from '@/views/Graphs/components/Graphs/Grafer.vue';
  import LocalGraph from '@/views/Graphs/components/Graphs/LocalGraph.vue';

  const TABS: TabInterface[] = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
    { name: 'Metadata', icon: 'info', id: 'metadata' },
  ];

  /** List of filtres fields displayed in the facets panel */
  const FACETS_FIELDS: string[] = [
    FILTRES_FIELDS.BELIEF_SCORE,
  ];

  const MAX_RESULTS_LOCAL_VIEW = 500;

  const components = {
    Counters,
    DrilldownPanel,
    EdgePane,
    FacetsPane,
    Grafer,
    LeftSidePanel,
    Loader,
    LocalGraph,
    MetadataPanel,
    ModalDocument,
    NodePane,
    ResizableGrid,
    SearchBar,
    Settings,
    SettingsBar,
  };

  @Component({ components })
  export default class Graph extends Vue {
    // Initialize as undefined to prevent vue from tracking changes to the bgraph instance
    bgraphInstance: any;

    // Store the graph data counts, as the bGraph instance is not reactive to changes.
    graphCount: { edges: number, nodes: number } = { edges: null, nodes: null };

    // Initialize as undefined to prevent Vue from observing changes within these large datasets
    // Grafer data is stored in Bio view data as they are required for mapping bgraph queries to grafer layers
    graferNodesData: GraferNodesData = undefined;
    graferIntraEdgesData: GraferEdgesData = undefined;
    graferInterEdgesData: GraferEdgesData = undefined;
    graferClustersLabelsData: GraferLabelsData = undefined;

    // Set true when the full graph layers are rendered as background context (ie. faded)
    grafersFullGraphContextIsBackgrounded: boolean = false;

    tabs: TabInterface[] = TABS;
    activeTabId: string = 'metadata';

    isOpenDrilldown: boolean = false;
    drilldownActivePaneId: string = '';
    drilldownPaneTitle = '';
    drilldownPaneSubtitle = '';
    drilldownMetadata: any = null;

    isSplitView = false;
    subgraph: GraphInterface = null;
    subgraphLoading: boolean = false;
    mainGraphLoading: boolean = true;

    neighborhoodSubgraphIds: string[] = [];

    showMessageTooLarge: boolean = false;
    showMessageEmpty: boolean = false;

    // Modal Document
    modalDocumentArtifact: any = null;
    showModalDocument: boolean = false;

    @Getter getKnowledgeGraphsList;
    @Getter getSelectedKnowledgeGraph;
    @Getter getFilters;
    @Getter getFiltres;
    @Action addFiltres;
    @Action setFiltres;
    @Mutation setSelectedKnowledgeGraph;

    @Watch('getFilters') onGetFiltersChanged (): void {
      if (this.bgraphInstance) {
        const subgraph = filterToBgraph(this.bgraphInstance, this.getFilters);

        // Render subgraph as grafer query layers
        this.renderSubgraphAsGraferLayers(subgraph);
        this.evaluateSubgraph(subgraph);
      }
    }

    @Watch('getKnowledgeGraphsList') async onGetKnowledgeGraphsListChanged (): Promise<void> {
      // If we do not have a selected graph, we try to find one from the route.
      if (!this.selectedGraph) {
        const graph = this.getKnowledgeGraphsList
          .find(graph => graph.metadata.id === this.$route.params.model_id);
        // We can set the one in the route has the selected one in the store.
        if (graph) {
          this.setSelectedKnowledgeGraph(graph.id);
        }
      }

      // Once we have a selected model available we can load the graph.
      if (this.selectedGraph) {
        await this.loadData();
      }
    }

    @Watch('neighborhoodSubgraphIds') onNeighborhoodSubgraphIdsChanged (): void {
      let neighborhoodSubgraph = this.bgraphInstance.v().filter(d => this.neighborhoodSubgraphIds.includes(d._id)).run().map(element => element.vertex);
      neighborhoodSubgraph = deepCopy(neighborhoodSubgraph, ['_in', '_out']);
      if (_.isEmpty(neighborhoodSubgraph)) {
        // No neighborhood selected. Render original filter layer.
        this.onGetFiltersChanged();
      } else {
        // Neighborhood selected. Render selected neighborhood.
        this.renderSubgraphAsGraferLayers(neighborhoodSubgraph);
      }
    }

    async mounted (): Promise<void> {
      eventHub.$on('get-bgraph', cb => cb(this.bgraphInstance));

      // Load the graph only if we have a selected model,
      // otherwise wait until the getKnowledgeGraphsList as loaded.
      if (this.selectedGraph) {
        await this.loadData();
      }
    }

    get countersData (): Counter[] {
      const counters: Counter[] = [
        { name: 'Nodes', value: this.graphCount.nodes },
        { name: 'Edges', value: this.graphCount.edges },
      ];

      if (this.subgraph) {
        counters.push(
          { name: 'Nodes', value: this.subgraphNodeCount, highlighted: true },
          { name: 'Edges', value: this.subgraphEdgeCount, highlighted: true },
        );
      }

      return counters;
    }

    get getIcon (): string {
      return this.isSplitView ? 'window-maximize' : 'columns';
    }

    get getMessage (): string {
      return this.isSplitView ? 'Close Local View' : 'Open Local View';
    }

    get selectedGraph (): KnowledgeGraph.Graph {
      return this.getKnowledgeGraphsList[this.getSelectedKnowledgeGraph];
    }

    get selectedGraphId (): string {
      return this.selectedGraph?.metadata.id;
    }

    get subgraphNodeCount (): number {
      return this.subgraph?.nodes.length ?? 0;
    }

    get subgraphEdgeCount (): number {
      return this.subgraph?.edges.length ?? 0;
    }

    get gridMap (): string[][] {
      return this.isSplitView ? [['1', '3', '2']] : [['1']];
    }

    get gridDimensions (): any {
      if (this.isSplitView) {
        return {
          // Keep the cell between 25% and 75% of container
          // 1: {
          //   widthMax: 0.75,
          //   widthMin: 0.25,
          // },
          // 2: {
          //   widthMax: 0.75,
          //   widthMin: 0.25,
          // },
          // Middle element to visually resize the columns
          3: {
            width: '10px',
            widthFixed: true,
          },
        };
      }
    }

    get canOpenLocalView (): boolean {
      return !isEmpty(this.getFilters);
    }

    async loadData (): Promise<void> {
      const [bgNodes, bgEdges] = await loadBGraphData(
        `${process.env.S3_BGRAPH_KNOWLEDGE_GRAPHS}/${this.selectedGraphId}/nodes.jsonl`,
        `${process.env.S3_BGRAPH_KNOWLEDGE_GRAPHS}/${this.selectedGraphId}/edges.jsonl`,
      );
      this.bgraphInstance = bgraph.graph(bgNodes, bgEdges);

      // Set the graph count
      this.graphCount = { edges: 0, nodes: 0 };
      bgNodes.forEach(bgNode => {
        if (bgNode._type === 'edge') ++this.graphCount.edges;
        else if (bgNode._type === 'node') ++this.graphCount.nodes;
      });

      const graferLayerData = await this.loadGraferData();
      // TODO: This takes up a lot of memory and will likely scale poorly
      this.graferNodesData = new Map();
      graferLayerData.graferNodesData.forEach(v => this.graferNodesData.set(v.id, v));
      this.graferIntraEdgesData = new Map();
      graferLayerData.graferIntraEdgesData.forEach(v => this.graferIntraEdgesData.set(v.id, v));
      this.graferInterEdgesData = new Map();
      graferLayerData.graferInterEdgesData.forEach(v => this.graferInterEdgesData.set(v.id, v));
      this.graferClustersLabelsData = new Map();
      graferLayerData.graferClustersLabelsData.forEach(v => this.graferClustersLabelsData.set(v.id, v));

      this.$nextTick(() => {
        // Ensure Grafer component has been mounted before sending
        // layer data. See: https://vuejs.org/v2/api/?#mounted
        eventHub.$emit('load-layers', graferLayerData);
      });

      // Initialize the filtres with what we display in the facets panel.
      this.setFiltres(FACETS_FIELDS);
      const newFiltres = getBGraphAggregatesFromFiltres(this.bgraphInstance, this.getFiltres, FACETS_FIELDS);
      this.addFiltres(newFiltres);
    }

    async loadGraferData (): Promise<BioGraferLayerDataPayloadInterface> {
      const [
        graferPointsData,
        graferNodesData,
        graferIntraEdgesData,
        graferInterEdgesData,
        graferClustersLabelsData,
      ] = await Promise.all([
        getS3Util(`${process.env.S3_GRAFER_KNOWLEDGE_GRAPHS}/${this.selectedGraphId}/points.jsonl`).then(data => loadJSONLFile(data)),
        getS3Util(`${process.env.S3_GRAFER_KNOWLEDGE_GRAPHS}/${this.selectedGraphId}/nodes.jsonl`).then(data => loadJSONLFile(data, BIO_NODE_LAYERS_NODE_OPTIONS)),
        getS3Util(`${process.env.S3_GRAFER_KNOWLEDGE_GRAPHS}/${this.selectedGraphId}/intra_edges.jsonl`).then(data => loadJSONLFile(data, BIO_NODE_LAYERS_EDGE_OPTIONS)),
        getS3Util(`${process.env.S3_GRAFER_KNOWLEDGE_GRAPHS}/${this.selectedGraphId}/inter_edges.jsonl`).then(data => loadJSONLFile(data, BIO_CLUSTER_LAYERS_EDGE_OPTIONS)),
        getS3Util(`${process.env.S3_GRAFER_KNOWLEDGE_GRAPHS}/${this.selectedGraphId}/groups.jsonl`).then(data => loadJSONLFile(data, BIO_CLUSTER_LAYERS_LABEL_OPTIONS)),
      ]);

      return {
        graferPointsData,
        graferNodesData,
        graferIntraEdgesData,
        graferInterEdgesData,
        graferClustersLabelsData,
      };
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    evaluateSubgraph (subgraph: any): void {
      if (_.isEmpty(subgraph)) {
          this.showMessageEmpty = true;
          this.showMessageTooLarge = false;
          this.subgraph = null;
        } else {
          if (subgraph.length <= MAX_RESULTS_LOCAL_VIEW) {
            this.subgraph = formatBGraphOutputToLocalGraph(subgraph);

            this.subgraphLoading = true;
            this.showMessageEmpty = false;
            this.showMessageTooLarge = false;
          } else {
            this.showMessageTooLarge = true;
            this.showMessageEmpty = false;
            this.subgraph = null;
          }
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    renderSubgraphAsGraferLayers (subgraph: any): void {
      // Render grafer query layers
      if (!this.mainGraphLoading) {
        // Queries can only be sent to grafer once it has been loaded.
        // TODO: A query that is made before Grafer has been rendered will not be called again.
        //       This problem is highlighted when you have an existing query in the search bar
        //       that gets run before Grafer has had a chance to load. To avoid this issue
        //       queries must be stored or re-run once the renderer has loaded.
        const graferQueryLayerNames = ['highlightClusterLayer', 'highlightNodeLayer'];
        if (!subgraph && _.isEmpty(this.getFilters?.clauses)) {
          // Clear query layers if no results
          eventHub.$emit('remove-layers', graferQueryLayerNames);
          if (this.grafersFullGraphContextIsBackgrounded) {
            // No query layers full graph is the main context
            eventHub.$emit('foreground-full-graph');
            this.grafersFullGraphContextIsBackgrounded = false;
          }
        } else {
          const graferQueryLayers = formatBGraphOutputToGraferLayers(subgraph, this.graferNodesData, this.graferIntraEdgesData, this.graferInterEdgesData, this.graferClustersLabelsData);
          eventHub.$emit('update-layers', graferQueryLayers, graferQueryLayerNames);
          if (!this.grafersFullGraphContextIsBackgrounded) {
            // Query layer set full graph acts as background context
            eventHub.$emit('background-full-graph');
            this.grafersFullGraphContextIsBackgrounded = true;
          }
        }
      }
    }

    onGraferClick (detail: GraferEventDetail): void {
      // eslint-disable-next-line
      console.log(`a [${detail.type}] with id [${detail.id}] on layer [${detail.layer}] was clicked!`);
    }

    onSplitView (): void {
      this.isSplitView = !this.isSplitView;
      const subgraph = filterToBgraph(this.bgraphInstance, this.getFilters);

      if (this.isSplitView) {
        this.evaluateSubgraph(subgraph);
      } else {
        this.subgraph = null;
      }
    }

    onTabClick (tabId: string): void {
      this.activeTabId = tabId;
    }

    onCloseDrilldownPanel ():void {
      this.isOpenDrilldown = false;
      this.drilldownPaneTitle = '';
      this.drilldownMetadata = null;
    }

    onNodeClick (node: GraphNodeInterface): void {
      // Compute node neighborhood to highlight in global view
      const outgoingEdges = this.bgraphInstance.v({ id: node.id }).out().run();
      const outgoingNodes = outgoingEdges.map(edge => edge.vertex.target_id);
      const incomingEdges = this.bgraphInstance.v({ id: node.id }).in().run();
      const incomingNodes = incomingEdges.map(edge => edge.vertex.source_id);

      const neighborEdgesIds = _.merge(outgoingEdges.map(e => e.vertex.id), incomingEdges.map(e => e.vertex.id));
      const neighborNodeIds = _.merge(outgoingNodes, incomingNodes);
      this.neighborhoodSubgraphIds = _.merge(neighborNodeIds, neighborEdgesIds);

      this.isOpenDrilldown = true;
      this.drilldownActivePaneId = 'node';

      this.drilldownMetadata = node.data;
    }

    onBackgroundClick (): void {
      this.neighborhoodSubgraphIds = [];
      this.onCloseDrilldownPanel();
    }

    async onEdgeClick (edge: GraphEdgeInterface): Promise<void> {
      this.isOpenDrilldown = true;
      this.drilldownActivePaneId = 'edge';

      this.drilldownMetadata = edge.data;
    }

    async onEvidenceClick (doi: string): Promise<void> {
      const artifact: CosmosArtifactInterface = await cosmosArtifactsMem({ doi });
      this.modalDocumentArtifact = artifact;
      this.showModalDocument = true;
    }

    onAddToSubgraph (edge: GraphEdgeInterface): void {
      const subgraph = _.clone(this.subgraph);
      const nodes = subgraph.nodes.map(node => node.label);
      const edges = subgraph.edges.map(edge => edge.source + '///' + edge.target);

      const bgraphSource = this.bgraphInstance.v({ name: edge.source }).run()[0].vertex;
      const bgraphTarget = this.bgraphInstance.v({ name: edge.target }).run()[0].vertex;

      // If the edge doesn't exist already in the subgraph
      if (edges.indexOf(bgraphSource.id + '///' + bgraphTarget.id) === -1) {
        const bgraphEdge = this.bgraphInstance.v({ source_id: bgraphSource.id, target_id: bgraphTarget.id }).run()[0].vertex;
         // Check if the source and target nodes already exist in the subgraph
        if (nodes.indexOf(edge.source) === -1) {
          const addedNode = _.clone(bgraphSource);
          addedNode.id = addedNode._id;
          addedNode.label = addedNode.name;
          subgraph.nodes.push(addedNode);
        }
        if (nodes.indexOf(edge.target) === -1) {
          const addedNode = _.clone(bgraphTarget);
          addedNode.id = addedNode._id;
          addedNode.label = addedNode.name;
          subgraph.nodes.push(addedNode);
        }

        const addedEdge = _.clone(bgraphEdge);
        addedEdge.source = addedEdge.source_id;
        addedEdge.target = addedEdge.target_id;
        subgraph.edges.push(addedEdge);

        Vue.set(this, 'subgraph', subgraph);
      }
    }
  }
</script>

<style scoped>
  .content {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .grafer {
    flex-grow: 1;
  }

  .left-side-panel {
    flex-shrink: 0;
  }
</style>
