<template>
  <div class="view-container">
    <header>
      <button
        class="btn btn-primary"
        :class="{ 'active': displaySearch }"
        @click="displaySearch = !displaySearch"
      >
        <font-awesome-icon :icon="['fas', 'search' ]" />
        Search
      </button>

      <button
        class="btn btn-primary"
        @click="onToggleProvenanceGraph">
        <font-awesome-icon :icon="['fas', 'project-diagram' ]" />
        <span>{{ isProvenanceGraphOpen ? 'Close' : 'Open' }} Provenance Graph</span>
      </button>

      <run-button
        :auto-run.sync="autoRun"
        :config.sync="runConfig"
        :disabled="!isRunFeasible"
        @reset="onResetSim"
        @run="fetchResults"
        @save="incrNumberOfSavedRuns"
      />

      <button
        class="btn-sim btn btn-primary"
        @click="onCloseSimView"
      >
        <font-awesome-icon :icon="['fas', 'sign-out-alt' ]" />
        Close Simulation
      </button>
    </header>

    <aside class="search-bar" :class="{ 'active': displaySearch }">
      <search-bar />
    </aside>

    <provenance-graph v-if="isProvenanceGraphOpen" :layouts="provenanceLayouts" :selectedLayoutId="selectedProvenanceLayout" @close-pane="onCloseProvenanceGraph" @layout-change="onSetProvenanceLayout">
      <provenance-graph-data
        slot="content"
        :data="provenanceGraphData"
      />
    </provenance-graph>

    <loader v-if="selectedModels.length < 1" loading="true" />
    <resizable-grid v-else :map="gridMap" :dimensions="gridDimensions">
      <template v-for="(model, index) in selectedModels">
        <model-panel
          class="simulation-panel"
          simulation="true"
          :expanded="expandedId === 'model'"
          :key="index"
          :model="model"
          :overlapping-elements="model.modelGraph[0].overlappingElements"
          :slot="('model_' + model.id)"
          @highlight="onNodeHighlight"
          @expand="setExpandedId('model')"
        />
        <parameters-panel
          class="simulation-panel"
          :expanded="expandedId === 'parameters'"
          :key="index"
          :modelId="model.id"
          :slot="('parameters_' + model.id)"
          :highlighted="highlighted"
          @expand="setExpandedId('parameters')"
        />
        <variables-panel
          class="simulation-panel"
          :expanded="expandedId === 'variables'"
          :key="index"
          :modelId="model.id"
          :slot="('variables_' + model.id)"
          :highlighted="highlighted"
          @expand="setExpandedId('variables')"
        />
      </template>
    </resizable-grid>

    <legend-panel>
      <graph-legend title="Graph" />
      <simulation-legend title="Simulation" />
    </legend-panel>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Watch } from 'vue-property-decorator';
  import { Action, Getter, Mutation } from 'vuex-class';
  import { RawLocation } from 'vue-router';
  import _ from 'lodash';

  import * as Model from '@/types/typesModel';
  import * as Graph from '@/types/typesGraphs';
  import * as RGrid from '@/types/typesResizableGrid';
  import * as Donu from '@/types/typesDonu';

  import Counters from '@/components/Counters.vue';
  import Loader from '@/components/widgets/Loader.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import SearchBar from '@/components/SearchBar.vue';
  import LegendPanel from '@/components/widgets/LegendPanel.vue';
  import GraphLegend from '@/views/Models/components/Graphs/GraphLegend.vue';
  import SimulationLegend from '@/views/Simulation/components/SimulationLegend.vue';
  import ModelPanel from '@/views/Simulation/components/ModelPanel.vue';
  import ParametersPanel from '@/views/Simulation/components/ParametersPanel.vue';
  import VariablesPanel from '@/views/Simulation/components/VariablesPanel.vue';
  import RunButton from '@/views/Simulation/components/RunButton.vue';
  import ProvenanceGraph from '@/views/Simulation/components/ProvenanceGraph/ProvenanceGraph.vue';
  import ProvenanceGraphData from '@/views/Simulation/components/ProvenanceGraph/ProvenanceGraphData.vue';
  import { ProvenanceData, ProvenanceLayoutInterface, ProvenanceLayoutInterfaceType } from '@/views/Simulation/components/ProvenanceGraph/ProvenanceData';

  const MODEL_COMPARISON = {
    gamma: 'rec_u',
    I: 'I_U',
    R: 'R',
    S: 'S',
    beta: 'inf_uu',
  };

  const PROVENANCE_LAYOUTS: ProvenanceLayoutInterface[] = [
    { name: 'Condensed', id: ProvenanceLayoutInterfaceType.condensed },
    { name: 'Detailed', id: ProvenanceLayoutInterfaceType.detailed },
  ];

  const components = {
    Counters,
    GraphLegend,
    LegendPanel,
    Loader,
    ModelPanel,
    ParametersPanel,
    ProvenanceGraph,
    ProvenanceGraphData,
    ResizableGrid,
    RunButton,
    SearchBar,
    SimulationLegend,
    VariablesPanel,
  };

  @Component({ components })
  export default class Simulation extends Vue {
    autoRun: boolean = false;
    displaySearch: boolean = false;
    expandedId: string = '';
    runConfig: Donu.RequestConfig = { end: 120, start: 0, step: 30 };
    subgraph: Graph.GraphInterface = null;
    highlighted: string = '';

    isProvenanceGraphOpen: boolean = false;
    provenanceLayouts: ProvenanceLayoutInterface[] = PROVENANCE_LAYOUTS;
    selectedProvenanceLayout: string = '';
    provenanceGraphData: Graph.GraphInterface = null;

    @Action fetchModelResults;
    @Action incrNumberOfSavedRuns;
    @Action initializeParameters;
    @Action initializeVariables;
    @Action resetSim;
    @Getter getSimModel;
    @Getter getModelsList;
    @Getter getSelectedModelGraphType
    @Getter getSelectedModelIds;
    @Getter getSimParameterArray;
    @Mutation setSelectedModels;

    @Watch('triggerFetchResults') onTriggerFetchResults (): void {
      if (this.autoRun) {
        this.fetchResults();
      }
    }

    @Watch('selectedModels') onModelChanged (): void {
      this.initializeSim();
    }

    mounted (): void {
      this.initializeSim();
    }

    /** Create an object that includes all variables that
     *  needs to trigger a refresh of the results. */
    get triggerFetchResults (): string {
      const { end, start, step } = this.runConfig;
      const currentRunAllParametersValues = [];
      this.getSelectedModelIds.map(modelId => {
        const modelParameters = this.getSimParameterArray(Number(modelId));
        // Just check the current run change of values
        if (modelParameters[0]) {
          currentRunAllParametersValues.push(...Object.values(modelParameters[0]));
        }
      });
      const watchObject = {
        config: { end, start, step },
        parameters: currentRunAllParametersValues.filter(Boolean),
      };
      return JSON.stringify(watchObject);
    }

    get selectedModels (): Model.Model[] {
      if (
        this.getSelectedModelIds.length < 1 && // Are we missing the selectedModelId,
        this.$route.params.model_id && // Does the model id is available from the route parameters,
        typeof this.$route.params.model_id === 'string' // Make sure the model id from the route is a string.
      ) {
        // Set the model id from the route as the selected model.
        this.$route.params.model_id.split(',').forEach(this.setSelectedModels);
      }

      const selectedModels = this.getModelsList.filter(model => this.getSelectedModelIds.map(Number).includes(model.id));
      // HACK: Adding the overlapping elements to the model graph information
      let nodes = [];
      selectedModels.forEach(model => {
        if (model.name === 'SimpleSIR_metadata') {
          nodes = Object.keys(MODEL_COMPARISON).map(node => ({ id: node }));
        } else if (model.name === 'SimpleChime+') {
          nodes = Object.values(MODEL_COMPARISON).map(node => ({ id: node }));
        }
        model.modelGraph[0].overlappingElements = { nodes, edges: [] };
      });
      return selectedModels;
    }

    get gridMap (): string[][] {
      const gridMap: string[][] = [];

      this.selectedModels.forEach(model => {
        if (this.expandedId) {
          gridMap.push([this.expandedId + '_' + model.id]);
        } else if (this.setSelectedModels) {
          gridMap.push([
            'model_' + model.id,
            'model-parameters-separator',
            'parameters_' + model.id,
            'parameters-variables-separator',
            'variables_' + model.id,
          ]);
        }
        // gridMap.push(['row-separator']);
      });

      return gridMap; // .slice(0, -1); // remove the last 'row-separator';
    }

    get gridDimensions (): RGrid.DimensionsInterface {
      return {
        'model-parameters-separator': {
          width: '10px',
          widthFixed: true,
        },
        'parameters-variables-separator': {
          width: '10px',
          widthFixed: true,
        },
        'row-separator': {
          height: '10px',
          heightFixed: true,
        },
      };
    }

    /** Check if a Run can be triggered or saved. */
    get isRunFeasible (): boolean {
      // Make sure that for every selected models
      return this.selectedModels.every(model => {
        // that every parameters of this model
        return this.getSimModel(model.id).parameters.every(parameter => {
          // does only contain numbers
          return parameter.values.every(_.isNumber);
        });
      });
    }

    get provenanceData (): Graph.GraphInterface {
      // If one model is selected, show the provenance graphs for the single model workflow
      if (this.selectedModels.length === 1) {
        return this.selectedProvenanceLayout === ProvenanceLayoutInterfaceType.condensed ? ProvenanceData.SINGLE_MODEL_CONDENSED : ProvenanceData.SINGLE_MODEL_DETAILED;
      } else {
      // If multiple models are selected, show the provenance graph for the multiple model workflow
        return this.selectedProvenanceLayout === ProvenanceLayoutInterfaceType.condensed ? ProvenanceData.MULTI_MODEL_CONDENSED : ProvenanceData.MULTI_MODEL_DETAILED;
      }
    }

    setExpandedId (id = ''): void {
      this.expandedId = id !== this.expandedId ? id : '';
    }

    onCloseSimView (): void {
      const options: RawLocation = {};
      if (this.getSelectedModelIds.length > 1) {
        options.name = 'comparison';
        options.params = {
          model_ids: this.getSelectedModelIds.join(','),
        };
      } else {
        options.name = 'model';
        options.params = {
          model_id: this.getSelectedModelIds.toString(),
        };
      }
      this.$router.push(options);
    }

    onResetSim (): void {
      this.resetSim();
      this.initializeSim();
    }

    initializeSim (): void {
      const selectedModelGraphType = this.getSelectedModelGraphType;
      if (this.selectedModels && selectedModelGraphType) {
        this.selectedModels.forEach(model => {
          this.initializeParameters({ model, selectedModelGraphType });
          this.initializeVariables({ model, selectedModelGraphType });
        });
      }
    }

    fetchResults (): void {
      if (this.selectedModels && this.getSelectedModelGraphType) {
        const config = this.runConfig;
        const selectedModelGraphType = this.getSelectedModelGraphType;
        this.selectedModels.forEach(model => {
          this.fetchModelResults({ model, config, selectedModelGraphType });
        });
      }
    }

    onNodeHighlight (label: string): void {
      this.highlighted = label;
    }

    onToggleProvenanceGraph (): void {
      // If the provenance graph is already open, close the graph
      if (this.isProvenanceGraphOpen) {
        this.closeProvenanceGraph();
      } else {
      // If the provenance graph is closed, open it and show the condensed graph by default
        this.isProvenanceGraphOpen = true;
        this.selectedProvenanceLayout = ProvenanceLayoutInterfaceType.condensed;
        this.provenanceGraphData = this.provenanceData;
      }
    }

    onSetProvenanceLayout (layoutId: string): void {
      this.selectedProvenanceLayout = layoutId;
      this.provenanceGraphData = this.provenanceData;
    }

    onCloseProvenanceGraph (): void {
      this.closeProvenanceGraph();
    }

    closeProvenanceGraph (): void {
      this.isProvenanceGraphOpen = false;
      this.selectedProvenanceLayout = null;
      this.provenanceGraphData = null;
    }
  }
</script>

<style scoped>
  .view-container {
    flex-direction: column;
    flex-grow: 1;
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

  /* Uniform sizing of the panels */
  .simulation-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  /* Uniform styling for the button in the settings-bars */
  .view-container::v-deep .settings-bar-container button {
    height: 2em;
    line-height: 0;
    padding-bottom: 0;
    padding-top: 0;
  }

  .view-container::v-deep .btn-primary.blue {
    background: var(--muted-highlight);
    border-color: var(--muted-highlight);
  }

  .left-side-panel {
    flex-shrink: 0;
  }
</style>
