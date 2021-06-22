<template>
  <div class="view-container">
    <left-side-panel
      class="left-side-panel"
      :activeTabId="activeTabId"
      :tabs="tabs"
      @tab-click="onTabClick"
    >
      <div slot="content">
        <metadata-panel
          v-if="activeTabId === 'metadata'"
          :metadata="selectedGraphMetadata"
        />
        <!-- <facets-pane v-if="activeTabId === 'facets'" />  -->
      </div>
    </left-side-panel>
    <div class="d-flex flex-column flex-grow-1 position-relative">
      <div class="search-row">
        <search-bar :placeholder="`Search for model components...`" @run-query="onRunQuery"/>
        <button class="btn btn-primary m-1" @click="onOpenSimView">
          <font-awesome-icon :icon="['fas', 'chart-line' ]" />
          <span> Open Simulation View </span>
        </button>
      </div>
      <resizable-grid :map="gridMap" :dimensions="gridDimensions">
        <div slot="1" class="h-100 w-100 d-flex flex-column">
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
          <global-graph v-if="selectedModel" :data="selectedGraph" @node-click="onNodeClick"/>
        </div>
        <div slot="2" class="h-100 w-100 d-flex flex-column">
          <settings-bar>
            <counters
              slot="left"
              :data="[
                { name: 'Nodes', value: subgraphNodeCount },
                { name: 'Edges', value: subgraphEdgeCount },
              ]"
              :title="`Subgraph`"
            />
            <settings
              slot="right"
              :selected-view-id="selectedViewId"
              :views="views"
              :selected-layout-id="selectedLayoutId"
              :layouts="layouts"
              @view-change="onSetView"
              @layout-change="onSetLayout"
            />
          </settings-bar>
          <local-graph v-if="isSplitView" :data="subgraph" @node-click="onNodeClick"/>
        </div>
      </resizable-grid>
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

  import { TabInterface, ViewInterface, ModelInterface } from '@/types/types';
  import * as GroMEt from '@/types/typesGroMEt';
  import { GraphInterface, GraphLayoutInterface, GraphNodeInterface, SubgraphInterface } from '@/types/typesGraphs';
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
  import LocalGraph from './components/Graphs/LocalGraph.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import MetadataPane from './components/DrilldownPanel/MetadataPane.vue';
  import KnowledgePane from './components/DrilldownPanel/KnowledgePane.vue';
  import ParametersPane from './components/DrilldownPanel/ParametersPane.vue';
  import ModalParameters from './components/Modals/ModalParameters.vue';
  import ModalDocMetadata from './components/Modals/ModalDocMetadata.vue';

  const TABS: TabInterface[] = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
    { name: 'Metadata', icon: 'info', id: 'metadata' },
  ];

  const VIEWS: ViewInterface[] = [
    { name: 'Petri Net Classic', id: 'ptc' },
    { name: 'Functional Network', id: 'fn' },
  ];

  const LAYOUTS: GraphLayoutInterface[] = [
    { name: 'Dagre', id: 'dagre' },
    { name: 'Layered', id: 'elk' },
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
    LocalGraph,
    ResizableGrid,
    DrilldownPanel,
    MetadataPane,
    ParametersPane,
    KnowledgePane,
    ModalParameters,
    ModalDocMetadata,
  };

  @Component({ components })
  export default class Model extends Vue {
    views: ViewInterface[] = VIEWS;
    selectedViewId = 'ptc';

    tabs: TabInterface[] = TABS;
    activeTabId: string = 'metadata';

    layouts: GraphLayoutInterface[] = LAYOUTS;
    selectedLayoutId: string = 'elk';

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
    subgraph: GraphInterface = null;
    showModalParameters: boolean = false;
    showModalMetadata: boolean = false;
    modalDataParameters: any = null;
    modalDataMetadata: any = null;
    highlights: SubgraphInterface = null;
    pathsCounter: number = 0;

    @Getter getSelectedModelIds;
    @Getter getModelsList;
    @Getter getSelectedModelGraph;
    @Mutation setSelectedModels;
    @Mutation setSelectedModelGraph;

    get selectedModel (): ModelInterface {
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

    get selectedGraphMetadata (): Array<GroMEt.ModelInterface | GroMEt.CodeCollectionInterface | GroMEt.TextualDocumentReferenceSet > {
      return this.selectedModel?.modelGraph[this.getSelectedModelGraph].metadata;
    }

    get selectedGraph (): GraphInterface {
      const index = this.selectedViewId === 'ptc' ? 0 : 1;
      return this.selectedModel?.modelGraph[index].graph;
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

    get gridMap (): string[][] {
      return this.isSplitView ? [['1', '3', '2']] : [['1']];
    }

    get gridDimensions (): any {
      if (this.isSplitView) {
        return {
          // Keep the cell between 25% and 75% of container
          /* Future features to be developed.
          1: {
            widthMax: 0.75,
            widthMin: 0.25,
          },
          2: {
            widthMax: 0.75,
            widthMin: 0.25,
          },
          */
          // Middle element to visually resize the columns
          3: {
            width: '10px',
            widthFixed: true,
          },
        };
      }
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

    onSplitView (): void {
      this.isSplitView = !this.isSplitView;
      if (!this.highlights) return;

      // Get path from highlights
      const path = this.highlights;
      const edges = path.edges;
      const nodes = path.nodes.map(node => this.selectedGraph.nodes.find(n => n.id === node.id));

      this.subgraph = { nodes, edges };
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
      // this.setSelectedModelGraph(index);
    }

selectedLayselectedLayoutId
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
      this.drilldownPaneSubtitle = node.nodeType;
      this.drilldownMetadata = null;

      // const nodeMetadata = node.metadata;
      // if (nodeMetadata) {
      //   const nodeKnowledge = { knowledge: bakedData.success.data }; // To show some text snippets
      //   this.drilldownMetadata = Object.assign({}, nodeKnowledge, nodeMetadata);

      //   // This probably will need to be refactored since we don't want to do all the queries at the same time, just on demand given the active tab
      //   const textDefinition = nodeMetadata.attributes[0].text_definition;
      //   this.formatParametersData();
      //   this.getRelatedParameters(textDefinition);
      //   this.searchCosmos(textDefinition);
      // }
    }

     async getSingleArtifact (id: string):Promise<CosmosSearchInterface> {
      const response = await cosmosArtifactSrc(id);
      return response;
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

    onRunQuery (): void {
      // this.highlights = paths[this.pathsCounter];
      // this.pathsCounter++;
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

  .left-side-panel {
    flex-shrink: 0;
  }
</style>
