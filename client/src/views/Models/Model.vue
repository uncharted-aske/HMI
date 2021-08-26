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
        @open-modal="onOpenModalMetadata"
      />
    </left-side-panel>

    <loader v-if="!selectedGraph" loading="true" />
    <section v-else>
      <header>
        <button
          class="btn btn-primary"
          :class="{ 'active': displaySearch }"
          @click="displaySearch = !displaySearch"
        >
          <font-awesome-icon :icon="['fas', 'search' ]" />
          Search
        </button>
        <settings
          slot="right"
          :layouts="layouts"
          :selected-layout-id="getModelsLayout"
          :selected-view-id="getSelectedModelGraphType"
          :views="graphTypesAvailable"
          @layout-change="setModelsLayout"
          @view-change="setSelectedModelGraphType"
        />
        <button
          class="btn-sim btn btn-primary"
          @click="onOpenSimView"
        >
          <font-awesome-icon :icon="['fas', 'chart-line' ]" />
          Open Simulation
        </button>
      </header>

      <aside class="search-bar" :class="{ 'active': displaySearch }">
        <search-bar :placeholder="`Search for model components...`"/>
      </aside>

      <settings-bar>
        <counters slot="left" :title="modelName" :data="countersData" />
      </settings-bar>

      <global-graph
        :data="selectedGraph"
        :subgraph="subgraph"
        :layout="getModelsLayout"
        @node-click="onNodeClick"
        @background-click="onBackgroundClick"
      />

      <legend-panel open="open">
        <graph-legend />
      </legend-panel>
    </section>

    <drilldown-panel
      class="drilldown-panel-model"
      :active-tab-id="drilldownActiveTabId"
      :is-open="isOpenDrilldown"
      :pane-subtitle="drilldownPaneSubtitle"
      :pane-title="drilldownPaneTitle"
      :tabs="drilldownTabs"
      @close-pane="onCloseDrilldownPanel"
      @tab-click="onDrilldownTabClick"
    >
      <metadata-pane
        v-if="drilldownActiveTabId === 'metadata' && drilldownMetadata"
        slot="content"
        :metadata="drilldownMetadata"
        :model-name="selectedModel.name"
        @open-modal="onOpenModalMetadata"
      />
      <parameters-pane
        v-if="drilldownActiveTabId === 'parameters'"
        slot="content"
        :related="drilldownRelatedParameters"
        @open-modal="onOpenModalParameters"
      />
      <knowledge-pane
        v-if="drilldownActiveTabId === 'knowledge'"
        slot="content"
        :data="drilldownKnowledge"
      />
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
  import { Action, Getter, Mutation } from 'vuex-class';
  import { RawLocation } from 'vue-router';
  import { Watch } from 'vue-property-decorator';
  import { bgraph } from '@uncharted.software/bgraph';
  import { merge } from 'lodash';

  import * as HMI from '@/types/types';
  import * as Graph from '@/types/typesGraphs';
  import * as GroMEt from '@/types/typesGroMEt';
  import * as Model from '@/types/typesModel';
  import { CosmosSearchInterface } from '@/types/typesCosmos';

  import { cosmosArtifactSrc, cosmosSearch, cosmosRelatedParameters, cosmosArtifactsMem } from '@/services/CosmosFetchService';
  import { filterToBgraph, deepCopy } from '@/utils/BGraphUtil';
  import { filterToParamObj } from '@/utils/CosmosDataUtil';

  import SearchBar from './components/SearchBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Counters from '@/components/Counters.vue';
  import Loader from '@/components/widgets/Loader.vue';
  import Settings from '@/views/Models/components/Settings.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPanel from '@/views/Models/components/MetadataPanel.vue';
  import FacetsPane from '@/views/Models/components/FacetsPane.vue';
  import GlobalGraph from './components/Graphs/GlobalGraph.vue';
  import LegendPanel from '@/components/widgets/LegendPanel.vue';
  import GraphLegend from './components/Graphs/GraphLegend.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import MetadataPane from './components/DrilldownPanel/MetadataPane.vue';
  import KnowledgePane from './components/DrilldownPanel/KnowledgePane.vue';
  import ParametersPane from './components/DrilldownPanel/ParametersPane.vue';
  import ModalParameters from './components/Modals/ModalParameters.vue';
  import ModalDocMetadata from './components/Modals/ModalDocMetadata.vue';

  const TABS: HMI.TabInterface[] = [
    // { name: 'Facets', icon: 'filter', id: 'facets' },
    { name: 'Metadata', icon: 'info', id: 'metadata' },
  ];

  const DRILLDOWN_TABS: HMI.TabInterface[] = [
    { name: 'Metadata', icon: '', id: 'metadata' },
    { name: 'Parameters', icon: '', id: 'parameters' },
    { name: 'Knowledge', icon: '', id: 'knowledge' },
  ];

  const components = {
    Counters,
    DrilldownPanel,
    FacetsPane,
    GlobalGraph,
    GraphLegend,
    KnowledgePane,
    LeftSidePanel,
    LegendPanel,
    Loader,
    MetadataPane,
    MetadataPanel,
    ModalDocMetadata,
    ModalParameters,
    ParametersPane,
    ResizableGrid,
    SearchBar,
    Settings,
    SettingsBar,
  };

  @Component({ components })
  export default class ModelView extends Vue {
    // Initialize as undefined to prevent vue from tracking changes to the bgraph instance
    bgraphInstance: any;

    tabs: HMI.TabInterface[] = TABS;
    activeTabId: string = 'metadata';

    selectedLayoutId: string = Graph.GraphLayoutInterfaceType.elk;
    layouts: Graph.GraphLayoutInterface[] = Graph.LAYOUTS;

    drilldownTabs: HMI.TabInterface[] = DRILLDOWN_TABS;
    isOpenDrilldown = false;
    drilldownActiveTabId: string = 'metadata';
    drilldownPaneTitle = '';
    drilldownPaneSubtitle = '';
    drilldownMetadata: any = null;
    drilldownKnowledge: CosmosSearchInterface | Record<any, never> = {};
    drilldownRelatedParameters: any = null;

    displaySearch: boolean = false;
    isSplitView = false;
    subgraph: Graph.SubgraphInterface = null;
    showModalParameters: boolean = false;
    showModalMetadata: boolean = false;
    modalDataParameters: any = null;
    modalDataMetadata: any = null;

    @Action initializeInterface;
    @Action resetSim;

    @Getter getFilters;
    @Getter getModelsLayout;
    @Getter getModelsList;
    @Getter getSelectedModelGraphType;
    @Getter getSelectedModelIds;
    @Getter getSimModel;

    @Mutation setModelsLayout;
    @Mutation setSelectedModelGraphType;
    @Mutation setSelectedModels;

    @Watch('getFilters') onGetFiltersChanged (): void {
      this.executeFilters();
    }

    @Watch('getSelectedModelGraphType') onModelGraphTypeChanged (): void {
      this.resetSim(); // We only save simulation info per model.id, not model.id + graph type.
      this.initializeSim();
    }

    mounted (): void {
      this.loadData();
      this.initializeSim();
    }

    initializeSim (): void {
      const model = this.selectedModel;
      const selectedModelGraphType = this.getSelectedModelGraphType;
      this.initializeInterface({ model, selectedModelGraphType });
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
      if (this.selectedModel && this.getSelectedModelGraphType) {
        const bgraphGraphData = this.selectedModel.modelGraph.find(d => d.type === this.getSelectedModelGraphType).bgraph;
        this.bgraphInstance = bgraph.graph(
          deepCopy(bgraphGraphData.nodes),
          deepCopy(bgraphGraphData.edges),
        );
        this.executeFilters();
      }
    }

    @Watch('selectedModel') onGetSelectedModelChange (): void {
      this.loadData();
    }

    @Watch('getSelectedModelGraphType') onGetGrometTypeChange (): void {
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

    get selectedModelGraph (): Model.Graph {
      return this.selectedModel?.modelGraph.find(graph => graph.type === this.getSelectedModelGraphType) ?? null;
    }

    get selectedGraphMetadata (): Model.GraphMetadata[] {
      return this.selectedModelGraph?.metadata ?? null;
    }

    get selectedGraph (): Graph.GraphInterface {
      return this.selectedModelGraph?.graph ?? null;
    }

    get graphTypesAvailable (): Model.ViewInterface[] {
      if (!this.selectedModel) return [];

      // Get the list of all the graph types available in the selected model
      const graphTypesAvailable = this.selectedModel?.modelGraph.map(graph => graph.type);
      if (graphTypesAvailable.length === 0) return [];

      // Filter the constant and only display the available ones
      return Model.GRAPHTYPE_VIEWS.filter(view => {
        return graphTypesAvailable.includes(view.id);
      });
    }

    get modelName (): string {
      return this.selectedModel?.metadata?.name;
    }

    get countersData (): HMI.Counter[] {
      const data: HMI.Counter[] = [];

      const { parameters, variables } = this.getSimModel(this.selectedModel.id) as HMI.SimulationModel;

      if (parameters.length > 0) {
        const nbInitialCondition = parameters.filter(p => p.initial_condition).length;

        if (nbInitialCondition > 0) {
          data.push({
            name: 'Initial Conditions',
            value: nbInitialCondition,
          });
        }

        data.push({
          name: 'Parameters',
          value: parameters.length - nbInitialCondition,
        });
      }
      if (variables.length > 0) {
        data.push({
          name: 'Variables',
          value: variables.length,
        });
      }
      return data;
    }

    onOpenSimView (): void {
      const options: RawLocation = { name: 'simulation' };

      // As of now we only allow one model to be selected at a time.
      const modelId = this.$route.params.model_id;
      if (modelId) {
        options.params = {
          model_ids: modelId.toString(),
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

    async getDrilldownKnowledge (): Promise<void> {
      try {
        if (this.selectedGraphMetadata?.constructor === Array) {
          const codeCollection = this.selectedGraphMetadata.find(metadata => {
            return metadata.metadata_type === GroMEt.MetadataType.CodeCollectionReference;
          }) as GroMEt.CodeCollectionInterface;

          if (codeCollection?.global_reference_id?.id) {
            this.drilldownKnowledge = merge(this.drilldownKnowledge, await cosmosSearch(filterToParamObj({
              cosmosAskeId: codeCollection.global_reference_id.id,
            })));
          }

          const textualDocumentReference = this.selectedGraphMetadata.find(metadata => {
            return metadata.metadata_type === GroMEt.MetadataType.TextualDocumentReferenceSet;
          }) as GroMEt.TextualDocumentReferenceSet;

          if (textualDocumentReference?.documents?.length) {
            this.drilldownKnowledge = merge(this.drilldownKnowledge, await cosmosSearch(filterToParamObj({
              cosmosAskeId: textualDocumentReference.documents[0].global_reference_id.id,
            })));
          }

          if (this.drilldownKnowledge.objects) {
            delete this.drilldownKnowledge.error;
          }
        }
      } catch (e) {
        throw Error(e);
      }
    }

    async getRelatedParameters (keyword: string): Promise<void> {
      const response = await cosmosRelatedParameters({ word: keyword, model: 'trigram', n: 10 });
      this.drilldownRelatedParameters = response.data;
    }

    onNodeClick (node: Graph.GraphNodeInterface): void {
      // Select which tab should be open first, then open the drilldown.
      this.drilldownActiveTabId = 'metadata';
      this.isOpenDrilldown = true;

      // HACK: Couldn't find metadata for this box so I just added it
      if (node.grometID === 'B:sir_r_n_exp') {
        this.drilldownMetadata = {
          metadata_type: 'EquationDefinition',
          uid: 'eqn_def_sir_i_n_exp',
          provenance: {
            metadata_type: 'Provenance',
            method: 'Manual_claytonm@az',
            timestamp: '2021-08-25T17:25:04:075378_MST-0700',
          },
          equation_extraction: {
            document_reference_uid: 'chime_webdocs_as_pdf',
            equation_number: 1,
            equation_source_latex: 'I_{t+1} = I_{t} + \\beta S_{t} I_{t} - \\gamma I_{t}',
            equation_source_mml: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" title="I_{t+1} = I_{t} + \beta S_{t} I_{t} - \\gamma I_{t} "><mrow><msub><mrow><mi>I</mi></mrow><mrow><mi>t</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mrow><mi>I</mi></mrow><mrow><mi>t</mi></mrow></msub><mo>+</mo><mi>\u03b2</mi><msub><mrow><mi>S</mi></mrow><mrow><mi>t</mi></mrow></msub><msub><mrow><mi>I</mi></mrow><mrow><mi>t</mi></mrow></msub><mo>-</mo><mi>\u03b3</mi><msub><mrow><mi>I</mi></mrow><mrow><mi>t</mi></mrow></msub></mrow></math>',
          },
        };
      }

      if (node.grometID === 'V:relative_contact_rate_1') {
        this.drilldownMetadata = [
        {
          type: 'DOMAIN',
          provenance: {
            method: 'PROGRAM_ANALYSIS_PIPELINE',
            timestamp: '2021-08-25 08:49:29.746121',
          },
          data_type: 'float',
          measurement_scale: 'continuous',
          elements: [],
        },
        {
          type: 'CODE_SPAN_REFERENCE',
          provenance: {
            method: 'PROGRAM_ANALYSIS_PIPELINE',
            timestamp: '2021-08-25 08:49:29.708781',
          },
          code_type: 'identifier',
          code_file_reference_uid: '',
          code_span: {
            line_begin: 237,
            line_end: 237,
            col_begin: 4,
            col_end: 32,
          },
        },
        {
          type: 'TEXT_DEFINITION',
          provenance: {
            method: 'TEXT_READING_PIPELINE',
            timestamp: '2021-08-25 08:49:30.080149',
          },
          text_extraction: {
            source_type: 'text_document_source',
            document_reference_uid: '',
            text_spans: [
              {
                page: null,
                block: null,
                span: {
                  char_begin: 4,
                  char_end: 32,
                },
              },
            ],
          },
          variable_identifier: '\u03b2',
          variable_definition: "model's parameters",
        },
        {
          type: 'TEXT_DEFINITION',
          provenance: {
            method: 'TEXT_READING_PIPELINE',
            timestamp: '2021-08-25 08:49:30.080149',
          },
          text_extraction: {
            source_type: 'text_document_source',
            document_reference_uid: '',
            text_spans: [
              {
                page: null,
                block: null,
                span: {
                  char_begin: 0,
                  char_end: 50,
                },
              },
            ],
          },
          variable_identifier: '\u03b2',
          variable_definition: 'effective contact rate',
        },
        {
          type: 'EQUATION_PARAMETER',
          provenance: {
            method: 'TEXT_READING_PIPELINE',
            timestamp: '2021-08-25 08:49:30.080149',
          },
          equation_extraction: {
            source_type: 'equation_document_source',
            document_reference_uid: '',
            equation_number: 3,
          },
          variable_identifier: '\u03b2',
          value: '\u03b2',
        },
        {
          type: 'EQUATION_PARAMETER',
          provenance: {
            method: 'TEXT_READING_PIPELINE',
            timestamp: '2021-08-25 08:49:30.080149',
          },
          equation_extraction: {
            source_type: 'equation_document_source',
            document_reference_uid: '',
            equation_number: 5,
          },
          variable_identifier: '\u03b2',
          value: '\u03b2',
        },
        {
          type: 'EQUATION_PARAMETER',
          provenance: {
            method: 'TEXT_READING_PIPELINE',
            timestamp: '2021-08-25 08:49:30.080149',
          },
          equation_extraction: {
            source_type: 'equation_document_source',
            document_reference_uid: '',
            equation_number: 2,
          },
          variable_identifier: '\u03b2',
          value: '\u03b2',
        },
        {
          type: 'EQUATION_PARAMETER',
          provenance: {
            method: 'TEXT_READING_PIPELINE',
            timestamp: '2021-08-25 08:49:30.080149',
          },
          equation_extraction: {
            source_type: 'equation_document_source',
            document_reference_uid: '',
            equation_number: 7,
          },
          variable_identifier: '\u03b2',
          value: '\u03b2',
        },
        {
          type: 'EQUATION_PARAMETER',
          provenance: {
            method: 'TEXT_READING_PIPELINE',
            timestamp: '2021-08-25 08:49:30.080149',
          },
          equation_extraction: {
            source_type: 'equation_document_source',
            document_reference_uid: '',
            equation_number: 0,
          },
          variable_identifier: '\u03b2',
          value: '\u03b2',
        },
        {
          type: 'EQUATION_PARAMETER',
          provenance: {
            method: 'TEXT_READING_PIPELINE',
            timestamp: '2021-08-25 08:49:30.080149',
          },
          equation_extraction: {
            source_type: 'equation_document_source',
            document_reference_uid: '',
            equation_number: 6,
          },
          variable_identifier: '\u03b2',
          value: '\u03b2',
        },
      ];
      }

      // Merge node metadata with Variables metadata. c.f. Graph.GraphNodeInterface type
      this.drilldownMetadata = node.metadata ? node.metadata.flat() : null;

      this.drilldownPaneSubtitle = `${node.nodeType} (${node.dataType})`;
      this.drilldownPaneTitle = node.label;
      this.getDrilldownKnowledge();
      this.getRelatedParameters(node.label);
    }

    onBackgroundClick ():void {
      this.isOpenDrilldown = false;
    }

    async getSingleArtifact (id: string):Promise<CosmosSearchInterface> {
      return await cosmosArtifactSrc(id);
    }

    async onOpenModalParameters (id: string):Promise<void> {
      const response = await this.getSingleArtifact(id);
      this.modalDataParameters = response;
      this.showModalParameters = true;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async onOpenModalMetadata (doc: any): Promise<void> {
      if (doc) {
        this.modalDataMetadata = merge(
          await cosmosArtifactsMem({ aske_id: doc.global_reference_id.id }),
          doc,
        );
      }
      this.showModalMetadata = true;
    }
  }
</script>

<style scoped>
  .left-side-panel {
    flex-shrink: 0;
  }

  .view-container section {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    position: relative;
  }

  header {
    align-items: center;
    background-color: var(--bg-secondary);
    display: flex;
    flex-direction: row;
    gap: 2em;
    justify-content: space-between;
    padding: 10px 5px;
  }

  header .btn-sim {
    width: 10.5em; /* Same as the close button on the simulation view */
  }

  .search-bar {
    background-color: var(--bg-secondary);
    flex-shrink: 0;
    max-height: 0;
    overflow: hidden;
    pointer-events: none; /* Avoid potential clicks to happen */
    transition: max-height 250ms ease-in-out;
    will-change: max-height;
  }

  .search-bar.active {
    max-height: 10rem; /* Random number bigger than actual height for the transition. */
    pointer-events: auto;
  }

  .search-bar .search-bar-container {
    margin-top: 0; /* To have an uniform spacing between the header and the search bar */
    margin-bottom: 10px; /* To match the header vertical spacing */
  }

  .drilldown-panel-container.drilldown-panel-model {
    max-width: 25vw;
    min-width: 500px;
    width: 500px;
  }
</style>
