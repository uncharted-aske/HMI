<template>
  <div class="view-container">
    <left-side-panel :tabs="tabs" :activeTabId="activeTabId" @tab-click="onTabClick">
          <div slot="content">
            <metadata-panel v-if="activeTabId ===  'metadata'" :metadata="selectedModel.metadata"/>
            <facets-pane v-if="activeTabId === 'facets'" />
          </div>
    </left-side-panel>
    <div class="search-row">
      <search-bar :placeholder="`Search for model components...`" @run-query="onRunQuery"/>
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
        <global-epi-graph v-if="selectedModel" :graph="selectedGraph" :highlights="highlights" @node-click="onNodeClick"/>
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
    <drilldown-panel @close-pane="onCloseDrilldownPanel" :tabs="drilldownTabs" :active-tab-id="drilldownActiveTabId" :is-open="isOpenDrilldown" :pane-title="drilldownPaneTitle" :pane-subtitle="drilldownPaneSubtitle" @tab-click="onDrilldownTabClick">
      <metadata-pane v-if="drilldownActiveTabId ===  'metadata'" slot="content" :data="drilldownMetadata" @open-modal="onOpenModalMetadata"/>
      <parameters-pane v-if="drilldownActiveTabId ===  'parameters'" slot="content" :data="drilldownParameters" :related="drilldownRelatedParameters" @open-modal="onOpenModalParameters"/>
      <knowledge-pane v-if="drilldownActiveTabId ===  'knowledge'" slot="content" :data="drilldownKnowledge"/>
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
  import { Getter } from 'vuex-class';

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
  import FacetsPane from './components/FacetsPane.vue';
  import GlobalEpiGraph from './components/EpiGraphs/GlobalEpiGraph.vue';
  import LocalEpiGraph from './components/EpiGraphs/LocalEpiGraph.vue';
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

  const paths = [{
                   nodes: [{
                     id: '3ca29049-d9c6-459e-be33-5912e8a1433b',
                   }, {
                     id: '4aa6aa7d-31bc-4c43-9462-087640c2bc3f',
                   }],
                   edges: [{
                     source: '3ca29049-d9c6-459e-be33-5912e8a1433b',
                     target: '4aa6aa7d-31bc-4c43-9462-087640c2bc3f',
                   }],
                 },
                 {
                   nodes: [{
                             id: '3ca29049-d9c6-459e-be33-5912e8a1433b',
                           },
                           {
                             id: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                           }, {
                             id: '9d2259db-62cc-444f-a4d4-03f5769ba39b',
                           },
                   ],
                   edges: [{
                             source: '3ca29049-d9c6-459e-be33-5912e8a1433b',
                             target: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                           },
                           {
                             source: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                             target: '9d2259db-62cc-444f-a4d4-03f5769ba39b',
                           },
                   ],
                 },
                 {
                   nodes: [{
                             id: '4aa6aa7d-31bc-4c43-9462-087640c2bc3f',
                           },
                           {
                             id: 'aa5a9672-d3f7-4c4a-95e2-d0a1a77197d0',
                           },
                           {
                             id: '475fca7c-194c-4abb-b19b-0aa28a0bb5d3',
                           },
                           {
                             id: 'b33a5e7a-35f3-4ec0-a9f4-b4b57e4bd524',
                           },
                           {
                             id: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                           },
                           {
                             id: '9d2259db-62cc-444f-a4d4-03f5769ba39b',
                           },
                   ],
                   edges: [{
                             source: '4aa6aa7d-31bc-4c43-9462-087640c2bc3f',
                             target: 'aa5a9672-d3f7-4c4a-95e2-d0a1a77197d0',
                           },
                           {
                             source: 'aa5a9672-d3f7-4c4a-95e2-d0a1a77197d0',
                             target: '475fca7c-194c-4abb-b19b-0aa28a0bb5d3',
                           },
                           {
                             source: '475fca7c-194c-4abb-b19b-0aa28a0bb5d3',
                             target: 'b33a5e7a-35f3-4ec0-a9f4-b4b57e4bd524',
                           },
                           {
                             source: 'b33a5e7a-35f3-4ec0-a9f4-b4b57e4bd524',
                             target: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                           },
                           {
                             source: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                             target: '9d2259db-62cc-444f-a4d4-03f5769ba39b',
                           },
                   ],
                 },
                 {
                   nodes: [{
                             id: '3ca29049-d9c6-459e-be33-5912e8a1433b',
                           },
                           {
                             id: '4aa6aa7d-31bc-4c43-9462-087640c2bc3f',
                           },
                           {
                             id: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                           },
                           {
                             id: '9d2259db-62cc-444f-a4d4-03f5769ba39b',
                           },
                           {
                             id: 'aa5a9672-d3f7-4c4a-95e2-d0a1a77197d0',
                           },
                           {
                             id: '475fca7c-194c-4abb-b19b-0aa28a0bb5d3',
                           },
                           {
                             id: 'b33a5e7a-35f3-4ec0-a9f4-b4b57e4bd524',
                           },
                           {
                             id: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                           },
                           {
                             id: '9d2259db-62cc-444f-a4d4-03f5769ba39b',
                           },
                   ],
                   edges: [
                     {
                       source: '3ca29049-d9c6-459e-be33-5912e8a1433b',
                       target: '4aa6aa7d-31bc-4c43-9462-087640c2bc3f',
                     },

                     {
                       source: '3ca29049-d9c6-459e-be33-5912e8a1433b',
                       target: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                     }, {
                       source: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                       target: '9d2259db-62cc-444f-a4d4-03f5769ba39b',
                     }, {
                       source: '4aa6aa7d-31bc-4c43-9462-087640c2bc3f',
                       target: 'aa5a9672-d3f7-4c4a-95e2-d0a1a77197d0',
                     }, {
                       source: 'aa5a9672-d3f7-4c4a-95e2-d0a1a77197d0',
                       target: '475fca7c-194c-4abb-b19b-0aa28a0bb5d3',
                     }, {
                       source: '475fca7c-194c-4abb-b19b-0aa28a0bb5d3',
                       target: 'b33a5e7a-35f3-4ec0-a9f4-b4b57e4bd524',
                     }, {
                       source: 'b33a5e7a-35f3-4ec0-a9f4-b4b57e4bd524',
                       target: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                     }, {
                       source: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                       target: '9d2259db-62cc-444f-a4d4-03f5769ba39b',
                     },
                   ],
                 },
                 {
                   nodes: [{
                     id: '4f8f229a-aab4-4db4-844b-64f68920dfad',
                   }, {
                     id: '9d85aa4e-2a80-42a9-a8fb-33d10932f2ac',
                   }, {
                     id: '4a3659ff-9c44-4352-9d3e-f592b2597b5a',
                   }, {
                     id: '26f0ec12-51a6-42e5-a5fd-afdad6d21f4e',
                   }, {
                     id: 'a9840a0e-8a1a-4eda-a9ca-7746f23d3677',
                   }, {
                     id: '4aa6aa7d-31bc-4c43-9462-087640c2bc3f',
                   }, {
                     id: 'aa5a9672-d3f7-4c4a-95e2-d0a1a77197d0',
                   }, {
                     id: '475fca7c-194c-4abb-b19b-0aa28a0bb5d3',
                   }, {
                     id: 'b33a5e7a-35f3-4ec0-a9f4-b4b57e4bd524',
                   }, {
                     id: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                   }, {
                     id: '9d2259db-62cc-444f-a4d4-03f5769ba39b',
                   }],
                   edges: [{
                     source: '4f8f229a-aab4-4db4-844b-64f68920dfad',
                     target: '9d85aa4e-2a80-42a9-a8fb-33d10932f2ac',
                   }, {
                     source: '9d85aa4e-2a80-42a9-a8fb-33d10932f2ac',
                     target: '4a3659ff-9c44-4352-9d3e-f592b2597b5a',
                   }, {
                     source: '4a3659ff-9c44-4352-9d3e-f592b2597b5a',
                     target: '26f0ec12-51a6-42e5-a5fd-afdad6d21f4e',
                   }, {
                     source: '26f0ec12-51a6-42e5-a5fd-afdad6d21f4e',
                     target: 'a9840a0e-8a1a-4eda-a9ca-7746f23d3677',
                   }, {
                     source: 'a9840a0e-8a1a-4eda-a9ca-7746f23d3677',
                     target: '4aa6aa7d-31bc-4c43-9462-087640c2bc3f',
                   }, {
                     source: '4aa6aa7d-31bc-4c43-9462-087640c2bc3f',
                     target: 'aa5a9672-d3f7-4c4a-95e2-d0a1a77197d0',
                   }, {
                     source: 'aa5a9672-d3f7-4c4a-95e2-d0a1a77197d0',
                     target: '475fca7c-194c-4abb-b19b-0aa28a0bb5d3',
                   }, {
                     source: '475fca7c-194c-4abb-b19b-0aa28a0bb5d3',
                     target: 'b33a5e7a-35f3-4ec0-a9f4-b4b57e4bd524',
                   }, {
                     source: 'b33a5e7a-35f3-4ec0-a9f4-b4b57e4bd524',
                     target: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                   }, {
                     source: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1',
                     target: '9d2259db-62cc-444f-a4d4-03f5769ba39b',
                   }],
                 },
  ];
  const components = {
    SearchBar,
    SettingsBar,
    Counters,
    Settings,
    LeftSidePanel,
    MetadataPanel,
    FacetsPane,
    GlobalEpiGraph,
    LocalEpiGraph,
    ResizableGrid,
    DrilldownPanel,
    MetadataPane,
    ParametersPane,
    KnowledgePane,
    ModalParameters,
    ModalDocMetadata,
  };

  @Component({ components })
  export default class EpiView extends Vue {
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
    @Getter getParameters;

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

    onRunQuery (): void {
      this.highlights = paths[this.pathsCounter];
      this.pathsCounter++;
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

</style>
