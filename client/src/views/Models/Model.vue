<template>
  <div class="view-container">
    <left-side-panel
      class="left-side-panel"
      :activeTabId="activeTabId"
      :tabs="tabs"
      @tab-click="onTabClick"
    >
      <metadata-panel
        slot="content"
        v-if="activeTabId === 'metadata'"
        :metadata="selectedGraphMetadata"
      />
    </left-side-panel>
    <div class="d-flex flex-column flex-grow-1 position-relative">
      <div class="search-row">
        <search-bar :placeholder="`Search for model components...`"/>
        <button class="btn btn-primary m-1" @click="onOpenSimView">
          <font-awesome-icon :icon="['fas', 'chart-line' ]" />
          <span> Open Simulation View </span>
        </button>
      </div>
      <div class="d-flex flex-column h-100 w-100">
        <settings-bar>
          <counters
            slot="left"
            :title="selectedModel && selectedModel.name"
            :data="[
              { name: 'Nodes', value: nodeCount },
              { name: 'Edges', value: edgeCount },
            ]"
          />
          <settings
            slot="right"
            :selected-view-id="selectedViewId"
            :views="views"
            :layouts="layouts"
            :selected-layout-id="selectedLayoutId"
            @view-change="onSetView"
            @layout-change="onSetLayout"
          />
        </settings-bar>
        <global-graph
          v-if="selectedGraph"
          :data="selectedGraph"
          :highlight="subgraph"
          :layout="selectedLayoutId"
          @node-click="onNodeClick"
        />
      </div>
    </div>
    <drilldown-panel @close-pane="onCloseDrilldownPanel" :tabs="drilldownTabs" :active-tab-id="drilldownActiveTabId" :is-open="isOpenDrilldown" :pane-title="drilldownPaneTitle" :pane-subtitle="drilldownPaneSubtitle" @tab-click="onDrilldownTabClick">
      <metadata-pane v-if="drilldownActiveTabId === 'metadata'" slot="content" :data="drilldownMetadata" @open-modal="onOpenModalMetadata"/>
      <parameters-pane v-if="drilldownActiveTabId === 'parameters'" slot="content" :data="drilldownParameters" :related="drilldownRelatedParameters" @open-modal="onOpenModalParameters"/>
      <knowledge-pane v-if="drilldownActiveTabId === 'knowledge'" slot="content" :data="drilldownKnowledge"/>
    </drilldown-panel>
    <modal-parameters
      v-if="showModalParameters"
      :data="modalDataParameters"
      @close="showModalParameters = false"
     />
     <modal-doc-metadata
      v-if="showModalMetadata"
      :data="modalDataMetadata"
      @close="showModalMetadata = false"
     />
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter, Mutation } from 'vuex-class';
  import { RawLocation } from 'vue-router';
  import { Watch } from 'vue-property-decorator';
  import { bgraph } from '@uncharted.software/bgraph';

  import {
    loadBGraphData,
    filterToBgraph,
  } from '@/utils/BGraphUtil';
  import { TabInterface, ViewInterface } from '@/types/types';
  import { GraphInterface, GraphLayoutInterface, GraphNodeInterface, SubgraphInterface, GraphLayoutInterfaceType } from '@/types/typesGraphs';
  import * as Model from '@/types/typesModel';
  import { CosmosSearchInterface } from '@/types/typesCosmos';
  import { cosmosArtifactSrc, cosmosSearch, cosmosRelatedParameters } from '@/services/CosmosFetchService';
  import { filterToParamObj } from '@/utils/CosmosDataUtil';

  import { NodeTypes } from '@/graphs/svg/encodings';

  import SearchBar from './components/SearchBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Counters from '@/components/Counters.vue';
  import Settings from '@/views/Models/components/Settings.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPanel from '@/views/Models/components/MetadataPanel.vue';
  import FacetsPane from '@/views/Models/components/FacetsPane.vue';
  import GlobalGraph from './components/Graphs/GlobalGraph.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import MetadataPane from './components/DrilldownPanel/MetadataPane.vue';
  import KnowledgePane from './components/DrilldownPanel/KnowledgePane.vue';
  import ParametersPane from './components/DrilldownPanel/ParametersPane.vue';
  import ModalParameters from './components/Modals/ModalParameters.vue';
  import ModalDocMetadata from './components/Modals/ModalDocMetadata.vue';

  const TABS: TabInterface[] = [
    // { name: 'Facets', icon: 'filter', id: 'facets' },
    { name: 'Metadata', icon: 'info', id: 'metadata' },
  ];

  const VIEWS: ViewInterface[] = [
    { name: 'Petri Net Classic', id: 'ptc' },
    { name: 'Functional Network', id: 'fn' },
  ];

  const LAYOUTS: GraphLayoutInterface[] = [
    { name: 'Layered', id: GraphLayoutInterfaceType.elk },
    { name: 'Dagre', id: GraphLayoutInterfaceType.dagre },
  ];

  const DRILLDOWN_TABS: TabInterface[] = [
    { name: 'Metadata', icon: '', id: 'metadata' },
    { name: 'Parameters', icon: '', id: 'parameters' },
    { name: 'Knowledge', icon: '', id: 'knowledge' },
  ];

  const components = {
    SearchBar,
    SettingsBar,
    Counters,
    Settings,
    LeftSidePanel,
    MetadataPanel,
    FacetsPane,
    GlobalGraph,
    ResizableGrid,
    DrilldownPanel,
    MetadataPane,
    ParametersPane,
    KnowledgePane,
    ModalParameters,
    ModalDocMetadata,
  };

  @Component({ components })
  export default class ModelView extends Vue {
    // Initialize as undefined to prevent vue from tracking changes to the bgraph instance
    bgraphInstance: any;

    views: ViewInterface[] = VIEWS;
    selectedViewId = 'ptc';

    tabs: TabInterface[] = TABS;
    activeTabId: string = 'metadata';

    layouts: GraphLayoutInterface[] = LAYOUTS;
    selectedLayoutId: string = GraphLayoutInterfaceType.elk;

    drilldownTabs: TabInterface[] = DRILLDOWN_TABS;
    isOpenDrilldown = false;
    drilldownActiveTabId: string = 'metadata';
    drilldownPaneTitle = '';
    drilldownPaneSubtitle = '';
    drilldownMetadata: any = null;
    drilldownKnowledge: CosmosSearchInterface | Record<any, never> = {};
    drilldownRelatedParameters: any = null;
    drilldownParameters: any = null;

    isSplitView = false;
    subgraph: SubgraphInterface = null;
    showModalParameters: boolean = false;
    showModalMetadata: boolean = false;
    modalDataParameters: any = null;
    modalDataMetadata: any = null;

    @Getter getSelectedModelIds;
    @Getter getModelsList;
    @Getter getParameters;
    @Getter getFilters;
    @Getter getSelectedModelGraph;
    @Mutation setSelectedModels;
    @Mutation setSelectedModelGraph;

    @Watch('getFilters') onGetFiltersChanged (): void {
      this.executeFilters();
    }

    mounted (): void {
      this.loadData();
      this.selectedViewId = VIEWS[this.getSelectedModelGraph].id;
    }

    executeFilters (): void {
      if (this.bgraphInstance && this.getFilters?.clauses.length > 0) {
        const subgraph = filterToBgraph(this.bgraphInstance, this.getFilters);
        this.subgraph = {
          nodes: subgraph.filter(d => d._type === 'node').map(n => n.id),
          edges: subgraph.filter(d => d._type === 'edge').map(e => ({ source: e.source, target: e.target })),
        };
      } else {
        this.subgraph = null;
      }
    }

    async loadData (): Promise<void> {
      if (this.selectedModel && this.grometType) {
        const [bgNodes, bgEdges] = await loadBGraphData(
          `${process.env.S3_BGRAPH_MODELS}/${this.selectedModel.metadata.name}/${this.grometType}/nodes.jsonl`,
          `${process.env.S3_BGRAPH_MODELS}/${this.selectedModel.metadata.name}/${this.grometType}/edges.jsonl`,
        );
        this.bgraphInstance = bgraph.graph(bgNodes, bgEdges);
        this.executeFilters();
      }
    }

    @Watch('selectedModel') onGetSelectedModelChange (): void {
      this.loadData();
    }

    @Watch('grometType') onGetGrometTypeChange (): void {
      this.loadData();
    }

    get selectedModel (): Model.Model {
      if (
        !this.getSelectedModelIds?.[0]?.toString() && // Are we missing the selectedModelId, toString to test id 0 as well,
        this.$route.params.model_id && // Does the model id is available from the route parameters,
        !Number.isNaN(this.$route.params.model_id) // Make sure the model id from the route is not a NaN.
      ) {
        // Set the model id from the route as the selected model.
        this.setSelectedModels(Number(this.$route.params.model_id));
      }
      return this.getModelsList.find(model => model.id === Number(this.getSelectedModelIds[0]));
    }

    get selectedGraphMetadata (): Model.GraphMetadata[] {
      return this.selectedModel?.modelGraph[this.getSelectedModelGraph].metadata;
    }

    get selectedGraph (): GraphInterface {
      const index = this.selectedViewId === 'ptc' ? 0 : 1;
      return this.selectedModel?.modelGraph[index].graph;
    }

    get grometType (): string {
      return this.selectedViewId === 'ptc' ? Model.GraphTypes.PetriNetClassic : Model.GraphTypes.FunctionNetwork;
    }

    get nodeCount (): number {
      return this.selectedGraph?.nodes.filter(n => n?.nodeType !== NodeTypes.NODES.CONTAINER).length;
    }

    get edgeCount (): number {
      return this.selectedGraph?.edges.length;
    }

    get subgraphNodeCount (): number {
      return this.subgraph?.nodes.length;
    }

    get subgraphEdgeCount (): number {
      return this.subgraph?.edges.length;
    }

    onOpenSimView (): void {
      const options: RawLocation = { name: 'simulation' };

      // As of now we only allow one model to be selected at a time.
      const modelId = this.$route.params.model_id;
      if (modelId) {
        options.params = {
          model_id: modelId.toString(),
        };
      }

      this.$router.push(options);
    }

    onTabClick (tabId: string): void {
      this.activeTabId = tabId;
    }

    onDrilldownTabClick (tabId: string): void {
      this.drilldownActiveTabId = tabId;
    }

    onCloseDrilldownPanel ():void {
      this.isOpenDrilldown = false;
      this.drilldownActiveTabId = '';
      this.drilldownPaneTitle = '';
      this.drilldownPaneSubtitle = '';
      this.drilldownMetadata = null;
    }

    onSetView (viewId: string): void {
      this.selectedViewId = viewId;
      const index = this.selectedViewId === 'ptc' ? 0 : 1;
      this.setSelectedModelGraph(index);
    }

    onSetLayout (layoutId: string): void {
      this.selectedLayoutId = layoutId;
    }

    async searchCosmos (keyword: string): Promise<void> {
        try {
          const response = await cosmosSearch(filterToParamObj({ cosmosQuery: [keyword] }));
          this.drilldownKnowledge = response;
        } catch (e) {
          throw Error(e);
        }
    }

    async getRelatedParameters (keyword: string): Promise<void> {
      const response = await cosmosRelatedParameters({ word: keyword, model: 'trigram', n: 10 });
      this.drilldownRelatedParameters = response.data;
    }

    onNodeClick (node: GraphNodeInterface): void {
      this.isOpenDrilldown = true;
      this.drilldownActiveTabId = 'metadata';

      this.drilldownPaneTitle = node.label;
      this.drilldownPaneSubtitle = `${node.nodeType} (${node.dataType})`;
      this.drilldownMetadata = node.metadata;
    }

    async getSingleArtifact (id: string):Promise<CosmosSearchInterface> {
      return await cosmosArtifactSrc(id);
    }

    async onOpenModalParameters (id: string):Promise<void> {
      const response = await this.getSingleArtifact(id);
      this.modalDataParameters = response;
      this.showModalParameters = true;
    }

    onOpenModalMetadata ():void {
      // this.modalDataMetadata = bibjson;
      this.showModalMetadata = true;
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

  .left-side-panel {
    flex-shrink: 0;
  }
</style>
