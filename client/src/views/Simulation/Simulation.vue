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

    <provenance-graph v-if="isProvenanceGraphOpen" @close-pane="onCloseProvenanceGraph" @layout-change="onSetProvenanceLayout">
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
          :expanded="expandedId === 'model'"
          :key="index"
          :model="model"
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

  import ModelPanel from '@/views/Simulation/components/ModelPanel.vue';
  import ParametersPanel from '@/views/Simulation/components/ParametersPanel.vue';
  import VariablesPanel from '@/views/Simulation/components/VariablesPanel.vue';
  import RunButton from '@/views/Simulation/components/RunButton.vue';
  import ProvenanceGraph from '@/views/Simulation/components/ProvenanceGraph/ProvenanceGraph.vue';
  import ProvenanceGraphData from '@/views/Simulation/components/ProvenanceGraph/ProvenanceGraphData.vue';

  // Placeholder constants for the provenance graph data, will refactor:
  const SINGLE_MODEL_CONDENSED = ({
    nodes: [{ id: 'Select', label: 'Select', role: ['Operation'] },
            { id: 'Execute 1', label: 'Execute', role: ['Operation'] },
            { id: 'Edit 1', label: 'Edit', role: ['Operation'] },
    ],
    edges: [{ id: 'Edge 1', source: 'Select', target: 'Execute 1' },
            { id: 'Edge 2', source: 'Select', target: 'Edit 1' },
            { id: 'Edge 3', source: 'Edit 1', target: 'Execute 1' },
    ],
  });

  const SINGLE_MODEL_EXPANDED = ({
    nodes: [{ id: 'Select', label: 'Select', role: ['Operation'] },
            { id: 'Edit', label: 'Edit', role: ['Operation'] },
            { id: 'Execute', label: 'Execute', role: ['Operation'] },
            { id: 'Models', label: 'Models', role: ['Data'] },
            { id: 'Model:v0', label: 'Model:v0', role: ['Data'] },
            { id: 'Param:v0', label: 'Param:v0', role: ['Data'] },
            { id: 'Param:v1', label: 'Param:v1', role: ['Data'] },
            { id: 'Variables:v1', label: 'Variables:v1', role: ['Data'] },
    ],
    edges: [{ id: 'Edge 1', source: 'Models', target: 'Select' },
            { id: 'Edge 2', source: 'Select', target: 'Model:v0' },
            { id: 'Edge 3', source: 'Select', target: 'Param:v0' },
            { id: 'Edge 4', source: 'Model:v0', target: 'Execute' },
            { id: 'Edge 5', source: 'Param:v0', target: 'Edit' },
            { id: 'Edge 6', source: 'Edit', target: 'Param:v1' },
            { id: 'Edge 7', source: 'Param:v1', target: 'Execute' },
            { id: 'Edge 8', source: 'Execute', target: 'Variables:v1' },
    ],
  });

  const MULTI_MODEL_CONDENSED = ({
    nodes: [{ id: 'Select', label: 'Select', role: ['Operation'] },
            { id: 'Execute 1', label: 'Execute', role: ['Operation'] },
            { id: 'Edit 1', label: 'Edit', role: ['Operation'] },
            { id: 'Edit 2', label: 'Edit', role: ['Operation'] },
    ],
    edges: [{ id: 'Edge 1', source: 'Select', target: 'Edit 1' },
            { id: 'Edge 2', source: 'Edit 1', target: 'Execute 1' },
            { id: 'Edge 3', source: 'Select', target: 'Edit 2' },
            { id: 'Edge 4', source: 'Edit 2', target: 'Execute 1' },
    ],
  });

  const MULTI_MODEL_EXPANDED = ({
    nodes: [{ id: 'Select', label: 'Select', role: ['Operation'] },
            { id: 'Edit 1', label: 'Edit', role: ['Operation'] },
            { id: 'Edit 2', label: 'Edit', role: ['Operation'] },
            { id: 'Execute', label: 'Execute', role: ['Operation'] },
            { id: 'Models', label: 'Models', role: ['Data'] },
            { id: 'Model 1', label: 'Model 1', role: ['Data'] },
            { id: 'Model 2', label: 'Model 2', role: ['Data'] },
            { id: 'Param 1:v0', label: 'Param 1:v0', role: ['Data'] },
            { id: 'Param 1:v1', label: 'Param 1:v1', role: ['Data'] },
            { id: 'Param 2:v0', label: 'Param 2:v0', role: ['Data'] },
            { id: 'Param 2:v1', label: 'Param 2:v1', role: ['Data'] },
            { id: 'Variables 1', label: 'Variables:v1', role: ['Data'] },
            { id: 'Variables 2', label: 'Variables:v2', role: ['Data'] },
    ],
    edges: [{ id: 'Edge 1', source: 'Models', target: 'Select' },
            { id: 'Edge 2', source: 'Select', target: 'Model 1' },
            { id: 'Edge 3', source: 'Select', target: 'Param 1:v0' },
            { id: 'Edge 4', source: 'Select', target: 'Model 2' },
            { id: 'Edge 5', source: 'Select', target: 'Param 2:v0' },
            { id: 'Edge 6', source: 'Param 1:v0', target: 'Edit 1' },
            { id: 'Edge 7', source: 'Edit 1', target: 'Param 1:v1' },
            { id: 'Edge 8', source: 'Param 2:v0', target: 'Edit 2' },
            { id: 'Edge 9', source: 'Edit 2', target: 'Param 2:v1' },
            { id: 'Edge 10', source: 'Model 1', target: 'Execute' },
            { id: 'Edge 11', source: 'Param 1:v1', target: 'Execute' },
            { id: 'Edge 12', source: 'Model 2', target: 'Execute' },
            { id: 'Edge 13', source: 'Param 2:v1', target: 'Execute' },
            { id: 'Edge 14', source: 'Execute', target: 'Variables 1' },
            { id: 'Edge 15', source: 'Execute', target: 'Variables 2' },
    ],
  });

  const components = {
    Counters,
    Loader,
    ModelPanel,
    ParametersPanel,
    ProvenanceGraph,
    ProvenanceGraphData,
    ResizableGrid,
    RunButton,
    SearchBar,
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
    provenanceActivePaneId: string = '';
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
      return this.getModelsList.filter(model => this.getSelectedModelIds.map(Number).includes(model.id));
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
      if (this.isProvenanceGraphOpen) {
        this.closeProvenanceGraph();
      } else {
        // Set the provenance graph state to open and show the condensed graph by default
        this.isProvenanceGraphOpen = true;
        this.provenanceActivePaneId = 'condensed';
        if (this.selectedModels.length === 1) {
          this.provenanceGraphData = SINGLE_MODEL_CONDENSED;
        } else {
          this.provenanceGraphData = MULTI_MODEL_CONDENSED;
        }
      }
    }

    onSetProvenanceLayout (tabId: string): void {
      this.provenanceActivePaneId = tabId;

      // If one model selected, show the provenance graphsfor the single model workflow
      if (this.selectedModels.length === 1) {
        if (this.provenanceActivePaneId === 'condensed') {
          this.provenanceGraphData = SINGLE_MODEL_CONDENSED;
        } else {
          this.provenanceGraphData = SINGLE_MODEL_EXPANDED;
        }
      } else {
      // If more than one models selected, show the provenance graph for the multiple model workflow
        if (this.provenanceActivePaneId === 'condensed') {
          this.provenanceGraphData = MULTI_MODEL_CONDENSED;
        } else {
          this.provenanceGraphData = MULTI_MODEL_EXPANDED;
        }
      }
    }

    onCloseProvenanceGraph (): void {
      this.closeProvenanceGraph();
    }

    closeProvenanceGraph (): void {
      this.isProvenanceGraphOpen = false;
      this.provenanceActivePaneId = null;
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
