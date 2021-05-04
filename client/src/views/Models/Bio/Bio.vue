<template>
  <div class="view-container">
    <left-side-panel
      class="left-side-panel"
      :activeTabId="activeTabId"
      :tabs="tabs"
      @tab-click="onTabClick"
    >
      <metadata-panel v-if="activeTabId === 'metadata'" slot="content" :metadata="selectedModel && selectedModel.metadata"/>
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
                :title="selectedModel && selectedModel.metadata.name"
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
          <local-graph v-if="subgraph" :data="subgraph"  @node-click="onNodeClick" @edge-click="onEdgeClick" @loaded="subgraphLoading = false"/>
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
      <node-pane v-if="drilldownActivePaneId === 'node'" slot="content"
        :model="selectedModelId"
        :data="drilldownMetadata"
      />
      <edge-pane v-if="drilldownActivePaneId === 'edge'" slot="content"
        :model="selectedModelId"
        :data="drilldownMetadata"
        @evidence-click="onEvidenceClick"
      />
    </drilldown-panel>

    <modal-document
      v-if="showModalDocument"
      :artifact="modalDocumentArtifact"
      @close="showModalDocument = false"
    />
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Action, Getter } from 'vuex-class';
  import { Watch } from 'vue-property-decorator';

  import { bgraph } from '@uncharted.software/bgraph';
  import { GraferNodesData, GraferEdgesData, GraferLabelsData } from '@uncharted.software/grafer';

  import { Counter, TabInterface, ModelInterface, GraferEventDetail } from '@/types/types';
  import { GraphInterface, GraphNodeInterface, GraphEdgeInterface } from '@/types/typesGraphs';
  import { BioGraferLayerDataPayloadInterface } from '@/types/typesGrafer';
  import { CosmosArtifactInterface } from '@/types/typesCosmos';
  import { FILTRES_FIELDS } from '@/types/typesFiltres';
  import eventHub from '@/eventHub';

  import {
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
  import EdgePane from './components/DrilldownPanel/EdgePane.vue';
  import FacetsPane from './components/FacetsPane.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import Loader from '@/components/widgets/Loader.vue';
  import LocalGraph from './components/Graphs/LocalGraph.vue';
  import MetadataPanel from '@/views/Models/components/MetadataPanel.vue';
  import ModalDocument from '@/components/Modals/ModalDocument.vue';
  import NodePane from './components/DrilldownPanel/NodePane.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import SearchBar from './components/SearchBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Settings from '@/views/Models/components/Settings.vue';

  import Grafer from './components/Graphs/Grafer.vue';

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
  export default class Bio extends Vue {
    // Initialize as undefined to prevent vue from tracking changes to the bgraph instance
    bgraphInstance: any;

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

    showMessageTooLarge: boolean = false;
    showMessageEmpty: boolean = false;

    // Modal Document
    modalDocumentArtifact: any = null;
    showModalDocument: boolean = false;

    @Getter getSelectedModelIds;
    @Getter getModelsList;
    @Getter getFilters;
    @Getter getFiltres;
    @Action addFiltres;
    @Action setFiltres;

    @Watch('getFilters') onGetFiltersChanged (): void {
      if (this.bgraphInstance) {
        const subgraph = filterToBgraph(this.bgraphInstance, this.getFilters);

        // Render subgraph as grafer query layers
        this.renderSubgraphAsGraferLayers(subgraph);
        this.evaluateSubgraph(subgraph);
      }
    }

    get countersData (): Counter[] {
      const counters: Counter[] = [
        { name: 'Nodes', value: 44104 },
        { name: 'Edges', value: 448723 },
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

    get selectedModel (): ModelInterface {
      const modelsList = this.getModelsList;
      return this.getSelectedModelIds.length ? modelsList[this.getSelectedModelIds[0]] : modelsList.find(model => model.metadata.id === 'covid19'); // Default to covid19 model
    }

    get selectedModelId (): string {
      return this.selectedModel?.metadata.id;
    }

    get subgraphNodeCount (): number {
      return (this.subgraph && this.subgraph.nodes.length) || 0;
    }

    get subgraphEdgeCount (): number {
      return (this.subgraph && this.subgraph.edges.length) || 0;
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

    async mounted (): Promise<void> {
      const [bgNodes, bgEdges] = await loadBGraphData();
      this.bgraphInstance = bgraph.graph(bgNodes, bgEdges);

      const graferLayerData = await this.loadGraferData();
      this.graferNodesData = graferLayerData.graferNodesData;
      this.graferIntraEdgesData = graferLayerData.graferIntraEdgesData;
      this.graferInterEdgesData = graferLayerData.graferInterEdgesData;
      this.graferClustersLabelsData = graferLayerData.graferClustersLabelsData;

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
        getS3Util(`${process.env.S3_GRAFER_MODELS}/${this.selectedModelId}/points.jsonl`).then(data => loadJSONLFile(data)),
        getS3Util(`${process.env.S3_GRAFER_MODELS}/${this.selectedModelId}/nodes.jsonl`).then(data => loadJSONLFile(data, BIO_NODE_LAYERS_NODE_OPTIONS)),
        getS3Util(`${process.env.S3_GRAFER_MODELS}/${this.selectedModelId}/intra_edges.jsonl`).then(data => loadJSONLFile(data, BIO_NODE_LAYERS_EDGE_OPTIONS)),
        getS3Util(`${process.env.S3_GRAFER_MODELS}/${this.selectedModelId}/inter_edges.jsonl`).then(data => loadJSONLFile(data, BIO_CLUSTER_LAYERS_EDGE_OPTIONS)),
        getS3Util(`${process.env.S3_GRAFER_MODELS}/${this.selectedModelId}/clusters.jsonl`).then(data => loadJSONLFile(data, BIO_CLUSTER_LAYERS_LABEL_OPTIONS)),
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

  // onSetView (viewId: string): void {
  //   this.selectedViewId = viewId;
  // }

    onNodeClick (node: GraphNodeInterface): void {
      this.isOpenDrilldown = true;
      this.drilldownActivePaneId = 'node';

      this.drilldownMetadata = node.data;
    }

    async onEdgeClick (edge: GraphEdgeInterface): Promise<void> {
      this.isOpenDrilldown = true;
      this.drilldownActivePaneId = 'edge';

      this.drilldownMetadata = edge.data;
    }

    async onEvidenceClick (doi:string): Promise<void> {
      const artifact: CosmosArtifactInterface = await cosmosArtifactsMem({ doi });
      this.modalDocumentArtifact = artifact;
      this.showModalDocument = true;
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

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
