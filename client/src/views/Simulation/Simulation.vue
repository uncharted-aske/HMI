<template>
  <div class="view-container">
    <div class="d-flex flex-column flex-grow-1 position-relative">
      <div class="search-row">
        <div class="search-col flex-column">
          <search-bar />
        </div>
        <div class="search-col mx-3 justify-content-between">
          <button class="btn btn-primary m-1">
            Simulate
          </button>
          <button class="btn btn-primary m-1">
            Provenence Graph
          </button>
          <div class="btn-group m-1" role="group" aria-label="Basic example">
            <button type="button" class="btn btn-primary" @click="onCloseSimView">Reset</button>
            <button type="button" class="btn btn-primary" @click="onCloseSimView">Save</button>
          </div>
        </div>
        <div class="search-col justify-content-end">
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1">
            <label class="form-check-label" for="inlineCheckbox1">Auto Run</label>
          </div>
          <button class="btn btn-primary m-1" @click="onCloseSimView">
            Run
          </button>
          <button class="btn btn-primary m-1" @click="onCloseSimView">
            Close Simulation View
          </button>
        </div>
      </div>
      <resizable-grid :map="gridMap" :dimensions="gridDimensions">
        <div slot="model" class="h-100 w-100 d-flex flex-column">
          <settings-bar>
            <counters
              slot="left"
              :title="selectedModel && selectedModel.metadata.name"
              :data="[
                { name: 'Parameters', value: 6 },
                { name: 'Variables', value: 3 },
              ]"
            />
            <button slot="right" type="button" class="btn btn-primary btn-settings" @click="setExpandedId('model')">B</button>
          </settings-bar>
          <global-graph v-if="selectedModel" :data="selectedGraph" @node-click="onNodeClick"/>
        </div>
        <div slot="parameters" class="h-100 w-100 d-flex flex-column">
          <settings-bar>
            <counters
              slot="left"
              title="3 Parameters"
              :data="[
                { name: 'Hidden', value: '4' },
              ]"
            />
            <div slot="right">
              <button type="button" class="btn btn-primary btn-settings" @click="onCloseSimView">Settings</button>
              <button type="button" class="btn btn-primary btn-settings" @click="setExpandedId('parameters')">B</button>
            </div>
          </settings-bar>
          <global-graph v-if="selectedModel" :data="selectedGraph" @node-click="onNodeClick"/>
        </div>
        <div slot="variables" class="h-100 w-100 d-flex flex-column">
          <settings-bar>
            <counters
              slot="left"
              title="0 Variables"
              :data="[
                { name: 'Hidden', value: '0' },
              ]"
            />
            <div slot="right">
              <button type="button" class="btn btn-primary btn-settings" @click="onCloseSimView">Settings</button>
              <button type="button" class="btn btn-primary btn-settings" @click="setExpandedId('variables')">B</button>
            </div>
          </settings-bar>
          <global-graph v-if="selectedModel" :data="selectedGraph" @node-click="onNodeClick"/>
        </div>
      </resizable-grid>
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter, Mutation } from 'vuex-class';
  import { RawLocation } from 'vue-router';

  import { TabInterface, ViewInterface, ModelInterface } from '@/types/types';
  import { GraphInterface, GraphNodeInterface } from '@/types/typesGraphs';

  import { NodeTypes } from '@/graphs/svg/encodings';

  import SettingsBar from '@/components/SettingsBar.vue';
  import Counters from '@/components/Counters.vue';
  import SearchBar from '@/components/SearchBar.vue';
  import Settings from '@/views/Models/components/Settings.vue';
  import FacetsPane from '@/views/Models/components/FacetsPane.vue';
  import GlobalGraph from '@/views/Models/components/Graphs/GlobalGraph.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';

  const TABS: TabInterface[] = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
    { name: 'Metadata', icon: 'info', id: 'metadata' },
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
    SettingsBar,
    Counters,
    SearchBar,
    Settings,
    FacetsPane,
    GlobalGraph,
    ResizableGrid,
  };

  @Component({ components })
  export default class Model extends Vue {
    views: ViewInterface[] = VIEWS;
    selectedViewId = 'causal';

    tabs: TabInterface[] = TABS;
    activeTabId: string = 'metadata';

    subgraph: GraphInterface = null;

    expandedId: string = '';

    @Getter getSelectedModelIds;
    @Getter getModelsList;
    @Mutation setSelectedModels;

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
      return this.expandedId
      ? [[this.expandedId]]
      : [
          ['model', 'div1', 'parameters', 'div2', 'variables'],
        ];
    }

    get gridDimensions (): any {
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
        div1: {
          width: '10px',
          widthFixed: true,
        },
        div2: {
          width: '10px',
          widthFixed: true,
        },
      };
    }

    setExpandedId (id = ''): void {
      this.expandedId = id !== this.expandedId ? id : '';
    }

    onCloseSimView (): void {
      const options: RawLocation = { name: 'model' };

      // As of now we only allow one Knowledgable Graph to be selected at a time.
      const modelId = this.$route.params.model_id;
      if (modelId) {
        options.params = {
          model_id: modelId.toString(),
        };
      }

      this.$router.push(options);
    }

    onNodeClick (node: GraphNodeInterface): void {
      const nodeMetadata = node.metadata;
      console.log(node);
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

  .btn-settings {
    height: 25px;
    line-height: 0;
  }

  .search-col {
    display: flex;
    flex: 1;
  }

  .left-side-panel {
    flex-shrink: 0;
  }
</style>
