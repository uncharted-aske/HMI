<template>
  <div class="view-container">
    <left-side-panel :tabs="tabs" :activeTabId="activeTabId" @tab-click="onTabClick">
          <div slot="content">
            <metadata-pane v-if="activeTabId ===  'metadata'" :metadata="selectedModel.metadata"/>
            <facets-pane v-if="activeTabId === 'facets'" />
          </div>
    </left-side-panel>
    <div class="search-row">
      <search-bar :placeholder="`Search for model components...`"/>
      <button class="btn btn-primary m-1" @click="onSplitView">
        Add Subgraph
      </button>
    </div>
    <resizable-grid :map="gridMap" :dimensions="{'3': { width: '10px', widthFixed: true }}">
      <div slot="1" class="h-100 w-100 d-flex flex-column">
        <settings-bar>
          <div slot="left">
            <counters
              :title="selectedModel.metadata.name"
              :data="[`${nodeCount} Nodes`, `${edgeCount} Edges`]"
            />
          </div>
          <div slot="right">
            <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/>
          </div>
        </settings-bar>
        <global-epi-graph v-if="selectedModel" :graph="selectedGraph" @node-click="onNodeClick"/>
      </div>
      <div slot="2" class="h-100 w-100 d-flex flex-column">
        <settings-bar>
          <div slot="left">
            <counters
              :title="`Subgraph`"
              :data="[`${subgraphNodeCount} Nodes`, `${subgraphEdgeCount} Edges`]"
            />          </div>
          <div slot="right">
            <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/>
          </div>
        </settings-bar>
        <local-epi-graph v-if="isSplitView" :graph="subgraph" @node-click="onNodeClick"/>
      </div>
    </resizable-grid>
    <drilldown-panel @close-pane="onCloseDrilldownPanel" :is-open="isOpenDrilldown" :tabs="tabsDrilldown" :activeTabId="activeTabIdDrilldown" :pane-title="drilldownPaneTitle" :pane-subtitle="drilldownPaneSubtitle" @tab-click="onTabClickDrilldown">
      <div slot="content">
        <drilldown-metadata-pane v-if="activeTabIdDrilldown ===  'metadata'" :metadata="drilldownMetadata" @open-modal="onOpenModal"/>
        <drilldown-parameters-pane v-if="activeTabIdDrilldown ===  'parameters'" @open-modal="onOpenModal"/>
        <drilldown-knowledge-pane v-if="activeTabIdDrilldown ===  'knowledge'" :data="drilldownKnowledge"/>
      </div>
    </drilldown-panel>
    <modal-knowledge
      v-if="showModal"
      :data="modalData"
      @close="showModal = false"
     />
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter } from 'vuex-class';

  import { TabInterface, ViewInterface, ModelInterface } from '@/types/types';
  import { GraphInterface, GraphNodeInterface } from '@/views/Graphs/types/types';
  import { CosmosArtifactInterface, CosmosSearchInterface } from '@/types/typesCosmos';
  import { cosmosArtifactSrc, cosmosArtifactsMem, filterToParamObj, cosmosSearch, cosmosRelatedParameters } from '@/utils/CosmosFetchUtil';
  import { NodeTypes } from '@/graphs/svg/encodings';

  import SearchBar from './components/SearchBar/SearchBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Counters from '@/views/Graphs/components/Counters/Counters.vue';
  import Settings from '@/views/Graphs/components/Settings/Settings.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPane from '@/views/Graphs/components/MetadataPane/MetadataPane.vue';
  import FacetsPane from './components/FacetsPane/FacetsPane.vue';
  import GlobalEpiGraph from './components/EpiGraphs/GlobalEpiGraph.vue';
  import LocalEpiGraph from './components/EpiGraphs/LocalEpiGraph.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import DrilldownMetadataPane from './components/DrilldownPanel/DrilldownMetadataPane.vue';
  import DrilldownParametersPane from './components/DrilldownPanel/DrilldownParametersPane.vue';
  import DrilldownKnowledgePane from './components/DrilldownPanel/DrilldownKnowledgePane.vue';
  import ModalKnowledge from './components/ModalKnowledge/ModalKnowledge.vue';

  const TABS: TabInterface[] = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
    { name: 'Metadata', icon: 'info', id: 'metadata' },
  ];

  const TABS_DRILLDOWN: TabInterface[] = [
    { name: 'Metadata', icon: 'filter', id: 'metadata' },
    { name: 'Parameters', icon: 'info', id: 'parameters' },
    { name: 'Knowledge', icon: 'info', id: 'knowledge' },
  ];

  const VIEWS: ViewInterface[] = [
    { name: 'Causal', id: 'causal' },
    { name: 'Functional', id: 'functional' },
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
        title: 'FORECASTING COVID-19 PANDEMIC: A DATA-DRIVEN ANALYSIS',
        doi: '10.1016/j.chaos.2020.110046',
        coverDate: 'Available online 25 June 2020',
        URL: 'https://www.sciencedirect.com/science/article/pii/S0960077920304434?v=s5',
        authors: '',
        highlight: ['carriers, our analysis estimates the value of the <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>', 'estimates the value of the <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> (R0 ) as', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> (R0 ) as of May 11, 2020 was found to be', '0) 0  181 182 183 184 185 186 187  188 189  190 191  3.2. <em class="hl">Basic</em> <em class="hl">Reproduction</em> <em class="hl">Number</em>', '0) 0  181 182 183 184 185 186 187  188 189  190 191  3.2. <em class="hl">Basic</em> <em class="hl">Reproduction</em> <em class="hl">Number</em> for Proposed', '<em class="hl">Basic</em> <em class="hl">Reproduction</em> <em class="hl">Number</em> for Proposed Model Using the next generation', '= −σ1 k γ + φD −σ2 k 0 φU + δU   The associated <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>,', '+ δU   The associated <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>, denoted', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>, denoted by R0 is then given by, R0 = ρ (FV', 'represents the robustness of the model forecasting. The <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>', 'model forecasting. The <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is 4.234', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is 4.234 as of May 08, which lies in prior', 'peak around June 11 with about 26.449K cases. The <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>', 'about 26.449K cases. The <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is estimated', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is estimated about 5.3467 as of May 11, which', 'about 5.3467 as of May 11, which is in between the observed <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> for', 'in between the observed <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> for COVID-19,', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> for COVID-19, estimated about 2-7 for COVID-19', 'peak around June 15 with about 9.504K cases. The <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>', 'about 9.504K cases. The <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is 5.218', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is 5.218 as of May 11, which lies between', 'of COVID-19 dynamics. According to our calculation, the <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>', 'to our calculation, the <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is around', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> is around 4.649 as of May 09, which lies', 'control the disease burden of COVID-19. Otherwise, this <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em>', 'COVID-19. Otherwise, this <em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> could increase', '<em class="hl">basic</em> <em class="hl">reproduction</em> <em class="hl">number</em> could increase upto 5.7 within 20 days and'],
      }],
    },
  };

  const components = {
    SearchBar,
    SettingsBar,
    Counters,
    Settings,
    LeftSidePanel,
    MetadataPane,
    FacetsPane,
    GlobalEpiGraph,
    LocalEpiGraph,
    ResizableGrid,
    DrilldownPanel,
    DrilldownMetadataPane,
    DrilldownParametersPane,
    DrilldownKnowledgePane,
    ModalKnowledge,
  };

  @Component({ components })
  export default class EpiView extends Vue {
    tabs: TabInterface[] = TABS;
    tabsDrilldown: TabInterface[] = TABS_DRILLDOWN;
    activeTabId: string = 'metadata';
    activeTabIdDrilldown: string = 'metadata';
    views: ViewInterface[] = VIEWS;
    selectedViewId = 'causal';
    isOpenDrilldown = false;
    isSplitView = false;
    drilldownPaneTitle = '';
    drilldownPaneSubtitle = '';
    drilldownMetadata: any = null;
    drilldownKnowledge: CosmosSearchInterface | Record<any, never> = {};
    drilldownParameters: any = null;
    subgraph: GraphInterface = null;
    showModal: boolean = false;
    modalData: any = null;

    @Getter getSelectedModelIds;
    @Getter getModelsList;

    get selectedModel (): ModelInterface {
      const modelsList = this.getModelsList;
      return modelsList.find(model => model.id === (this.getSelectedModelIds && this.getSelectedModelIds[0]));
    }

    get selectedGraph (): GraphInterface {
      return this.selectedViewId === 'causal' ? this.selectedModel.graph.abstract : this.selectedModel.graph.detailed;
    }

    get nodeCount (): number {
      const leafNodesCount = this.selectedGraph.nodes.filter(n => n.nodeType && n.nodeType !== NodeTypes.NODES.CONTAINER).length;
      return leafNodesCount;
    }

    get edgeCount (): number {
      return this.selectedGraph && this.selectedGraph.edges.length;
    }

    get subgraphNodeCount (): number {
      return this.subgraph && this.subgraph.nodes.length;
    }

    get subgraphEdgeCount (): number {
      return this.subgraph && this.subgraph.edges.length;
    }

    get gridMap (): string[][] {
      return this.isSplitView ? [['1', '3', '2']] : [['1']];
    }

    onSplitView (): void {
      this.isSplitView = !this.isSplitView;

      // Get the CHIME GrFN subgraph
      const modelsList = this.getModelsList;
      const selectedModel = modelsList.find(model => model.id === 2); // Get CHIME model
      const GrFN = selectedModel.graph.detailed;
      // Get nodes only corresponding to the SIR plate
      const nodes = GrFN.nodes.filter(n => n.parent === 'bac81b1a-3a6d-45ad-9725-947e507f6930'); // sir plate has id: 2bfc84bb-f036-4420-a68c-4ef6d72928e9
      const nodesMap = new Map();
      // Creates a map of nodes and its corresponding parents
      nodes.forEach(n => {
        nodesMap[n.id] = n.parent;
      });
      const edges = GrFN.edges.filter(e => {
        const sourceParent = nodesMap[e.source];
        const targetParent = nodesMap[e.target];
        return ((sourceParent === 'bac81b1a-3a6d-45ad-9725-947e507f6930') && (targetParent === 'bac81b1a-3a6d-45ad-9725-947e507f6930'));
      });

      this.subgraph = { nodes, edges };
    }

    onTabClick (tabId: string): void {
      this.activeTabId = tabId;
    }

    onTabClickDrilldown (tabId: string): void {
      this.activeTabIdDrilldown = tabId;
    }

    onCloseDrilldownPanel ():void {
      this.isOpenDrilldown = false;
      this.drilldownPaneTitle = '';
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
      const response = await cosmosRelatedParameters({ word: keyword, model: 'trigam', n: 100 });
      this.drilldownParameters = response;
    }

    onNodeClick (node: GraphNodeInterface): void {
      this.isOpenDrilldown = true;

      this.drilldownPaneTitle = node.label;
      this.drilldownPaneSubtitle = node.nodeType;

      const nodeMetadata = node.metadata;
      const nodeKnowledge = { knowledge: bakedData.success.data }; // To show some text snippets
      this.drilldownMetadata = Object.assign({}, nodeKnowledge, nodeMetadata);

      // This probably will need to be refactored since we don't want to do all the queries at the same time, just on demand given the active tab
      const textDefinition = nodeMetadata.attributes[0].text_definition;
      this.searchCosmos(textDefinition);
      this.getRelatedParameters(textDefinition);
    }

     async getSingleArtifact (id: string):Promise<CosmosSearchInterface> {
      const response = await cosmosArtifactSrc(id);
      return response;
    }

    async onOpenModal (d: any):Promise<void> {
      const artifact = await this.getSingleArtifact(d.object_id);
      this.modalData = artifact;
      this.showModal = true;
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

</style>
