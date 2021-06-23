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
          :metadata="selectedModel && selectedModel.metadata"
        />
        <facets-pane v-if="activeTabId === 'facets'" />
      </div>
    </left-side-panel>
    <div class="d-flex flex-column flex-grow-1 position-relative">
      <div class="search-row">
        <search-bar :placeholder="`Search for model components...`"/>
        <button class="btn btn-primary m-1" @click="onOpenSimView">
          <font-awesome-icon :icon="['fas', 'chart-line' ]" />
          <span> Open Simulation View </span>
        </button>
      </div>
      <div class="h-100 w-100 d-flex flex-column">
        <settings-bar>
          <counters
            slot="left"
            :title="selectedModel && selectedModel.metadata.name"
            :data="[
              { name: 'Nodes', value: nodeCount },
              { name: 'Edges', value: edgeCount },
            ]"
          />
          <settings
            slot="right"
            :selected-view-id="selectedViewId"
            :views="views"
            @view-change="onSetView"
          />
        </settings-bar>
        <global-graph v-if="selectedModel" :data="selectedGraph" :highlight="querygraph" @node-click="onNodeClick"/>
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
  import { TabInterface, ViewInterface, ModelInterface } from '@/types/types';
  import { GraphInterface, GraphNodeInterface, SubgraphInterface } from '@/types/typesGraphs';
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
    { name: 'Causal', id: 'causal' },
    { name: 'Functional', id: 'functional' },
  ];

  const DRILLDOWN_TABS: TabInterface[] = [
    { name: 'Metadata', icon: '', id: 'metadata' },
    { name: 'Parameters', icon: '', id: 'parameters' },
    { name: 'Knowledge', icon: '', id: 'knowledge' },
  ];

  /**
  Temporary hack for workshop
  **/
  const bakedData = {
    success: {
      v: 1,
      next_page: '',
      scrollId: '',
      hits: 1,
      data: [{
        pubname: 'Chaos, Solitons & Fractals',
        publisher: 'Elsevier',
        _gddid: '5ef5fd21a58f1dfd520aec60',
        title: 'CHIME: COVID-19 Hospital Impact for Epidemics - Online Documentation',
        doi: '',
        coverDate: '2021-01-19T21:08',
        URL: 'https://drive.google.com/file/d/122LEBSEMF9x-3r3tWbF6YQ9xeV4I_9Eh/view?usp=sharing',
        authors: [{ name: 'Jason Lubken' },
                  { name: 'Marieke Jackson' },
                  { name: 'Michael Chow' }],
        highlight: ['carriers, our analysis estimates the value of the <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>', 'estimates the value of the <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> (R0 ) as', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> (R0 ) as of May 11, 2020 was found to be', '0) 0  181 182 183 184 185 186 187  188 189  190 191  3.2. <em class="hl">Basic</em> <em class="hl">Reproduction</em> <em class="hl">Number</em>', '0) 0  181 182 183 184 185 186 187  188 189  190 191  3.2. <em class="hl">Basic</em> <em class="hl">Reproduction</em> <em class="hl">Number</em> for Proposed', '<em class="hl">Basic</em> <em class="hl">Reproduction</em> <em class="hl">Number</em> for Proposed Model Using the next generation', '= −σ1 k γ + φD −σ2 k 0 φU + δU   The associated <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>,', '+ δU   The associated <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>, denoted', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>, denoted by R0 is then given by, R0 = ρ (FV', 'represents the robustness of the model forecasting. The <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>', 'model forecasting. The <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is 4.234', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is 4.234 as of May 08, which lies in prior', 'peak around June 11 with about 26.449K cases. The <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>', 'about 26.449K cases. The <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is estimated', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is estimated about 5.3467 as of May 11, which', 'about 5.3467 as of May 11, which is in between the observed <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> for', 'in between the observed <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> for COVID-19,', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> for COVID-19, estimated about 2-7 for COVID-19', 'peak around June 15 with about 9.504K cases. The <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>', 'about 9.504K cases. The <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is 5.218', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is 5.218 as of May 11, which lies between', 'of COVID-19 dynamics. According to our calculation, the <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>', 'to our calculation, the <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is around', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is around 4.649 as of May 09, which lies', 'control the disease burden of COVID-19. Otherwise, this <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>', 'COVID-19. Otherwise, this <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> could increase', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> could increase upto 5.7 within 20 days and'],
      }],
    },
  };

  const bibjson = {
    bibjson: {
      title: 'CHIME: COVID-19 Hospital Impact for Epidemics - Online Documentation',
      author: [
        { name: 'Jason Lubken' },
        { name: 'Marieke Jackson' },
        { name: 'Michael Chow' },
      ],
      type: 'web_documentation',
      link: [{ url: 'https://code-for-philly.gitbook.io/chime/' }],
      year: '2021-01-19T21:08',
      file: 'CHIME-online-manual-T2021-01-19.pdf',
      file_url: 'https://drive.google.com/file/d/122LEBSEMF9x-3r3tWbF6YQ9xeV4I_9Eh/view?usp=sharing',
      identifier: [{ type: 'aske_id', id: '8467496e-3dfb-4efd-9061-433fef1b92de' }],
    },
  };

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
    // Initialize as undefined to prevent vue from tracking changes to the bgraph instance
    bgraphInstance: any;

    views: ViewInterface[] = VIEWS;
    selectedViewId = 'causal';

    tabs: TabInterface[] = TABS;
    activeTabId: string = 'metadata';

    drilldownTabs: TabInterface[] = DRILLDOWN_TABS;
    isOpenDrilldown = false;
    drilldownActiveTabId: string = 'metadata';
    drilldownPaneTitle = '';
    drilldownPaneSubtitle = '';
    drilldownMetadata: any = null;
    drilldownKnowledge: CosmosSearchInterface | Record<any, never> = {};
    drilldownRelatedParameters: any = null;
    drilldownParameters: any = null;

    subgraph: GraphInterface = null;
    querygraph: any = null;
    showModalParameters: boolean = false;
    showModalMetadata: boolean = false;
    modalDataParameters: any = null;
    modalDataMetadata: any = null;
    highlights: SubgraphInterface = null;

    @Getter getSelectedModelIds;
    @Getter getModelsList;
    @Getter getParameters;
    @Getter getFilters;
    @Mutation setSelectedModels;

    @Watch('getFilters') onGetFiltersChanged (): void {
      this.executeFilters();
    }

    async mounted (): Promise<void> {
      await this.loadData();
    }

    executeFilters (): void {
      if (this.bgraphInstance && this.getFilters?.clauses.length > 0) {
        const querygraph = filterToBgraph(this.bgraphInstance, this.getFilters);
        this.querygraph = {
          nodes: querygraph.filter(d => d._type === 'node').map(n => n.id),
          edges: querygraph.filter(d => d._type === 'edge').map(e => ({ source: e.source, target: e.target })),
        };
      } else {
        this.querygraph = null;
      }
    }

    async loadData (): Promise<void> {
      if (this.selectedModel && this.grometType) {
        const [bgNodes, bgEdges] = await loadBGraphData(
          `${process.env.S3_BGRAPH_EPI_MODELS}/${this.selectedModel.metadata.name}/${this.grometType}/nodes.jsonl`,
          `${process.env.S3_BGRAPH_EPI_MODELS}/${this.selectedModel.metadata.name}/${this.grometType}/edges.jsonl`,
        );
        this.bgraphInstance = bgraph.graph(bgNodes, bgEdges);
        this.executeFilters();
      }
    }

    @Watch('selectedModel') async onGetSelectedModelChange (): Promise<void> {
      await this.loadData();
    }

    @Watch('grometType') async onGetGrometTypeChange (): Promise<void> {
      await this.loadData();
    }

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

    get selectedGraph (): GraphInterface {
      return this.selectedViewId === 'causal' ? this.selectedModel?.graph?.abstract : this.selectedModel?.graph?.detailed;
    }

    get grometType (): string {
      // TODO: Reverse these
      return this.selectedViewId === 'causal' ? 'PNC' : 'GrFN';
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

    formatParametersData (): any {
      const parametersArray = [];
      Object.keys(this.getParameters).forEach(key => {
        parametersArray.push(this.getParameters[key]);
      });
      this.drilldownParameters = parametersArray;
    }

    onNodeClick (node: GraphNodeInterface): void {
      this.isOpenDrilldown = true;
      this.drilldownActiveTabId = 'metadata';

      this.drilldownPaneTitle = node.label;
      this.drilldownPaneSubtitle = node.nodeType;
      this.drilldownMetadata = null;

      const nodeMetadata = node.metadata;
      if (nodeMetadata) {
        const nodeKnowledge = { knowledge: bakedData.success.data }; // To show some text snippets
        this.drilldownMetadata = Object.assign({}, nodeKnowledge, nodeMetadata);

        // This probably will need to be refactored since we don't want to do all the queries at the same time, just on demand given the active tab
        const textDefinition = nodeMetadata.attributes[0].text_definition;
        this.formatParametersData();
        this.getRelatedParameters(textDefinition);
        this.searchCosmos(textDefinition);
      }
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
      this.modalDataMetadata = bibjson;
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
