<template>
  <div class="view-container">
    <div class="search-row">
      <div class="search-col flex-column">
        <search-bar />
      </div>
      <div class="search-col mx-3 justify-content-between">
        <button class="btn btn-primary blue m-1">
          Simulate
        </button>
        <button class="btn btn-primary m-1">
          <font-awesome-icon :icon="['fas', 'project-diagram' ]" />
          <span>Provenance Graph </span>
        </button>
      </div>
      <div class="search-col justify-content-end">
        <run-button
          class="m-1"
          :auto-run.sync="autoRun"
          :config.sync="runConfig"
          @run="fetchResults"
        />
        <div class="btn-group m-1">
          <button class="btn btn-primary" title="Save current run" @click="incrNumberOfSavedRuns">
            <font-awesome-icon :icon="['fas', 'bookmark' ]" />
          </button>
          <button class="btn btn-primary" title="Reset all saved runs" @click="onResetSim">
            <font-awesome-icon :icon="['fas', 'undo' ]" />
          </button>
        </div>
        <button class="btn btn-primary m-1" @click="onCloseSimView">
          <font-awesome-icon :icon="['fas', 'sign-out-alt' ]" />
          <span> Close Simulation </span>
        </button>
      </div>
    </div>
    <resizable-grid :map="gridMap" :dimensions="gridDimensions">
      <model-panel
        class="simulation-panel"
        slot="model"
        :expanded="expandedId === 'model'"
        :model="selectedModel"
        @expand="setExpandedId('model')"
      />
      <parameters-panel
        class="simulation-panel"
        slot="parameters"
        :expanded="expandedId === 'parameters'"
        @expand="setExpandedId('parameters')"
      />
      <variables-panel
        class="simulation-panel"
        slot="variables"
        :expanded="expandedId === 'variables'"
        @expand="setExpandedId('variables')"
      />
    </resizable-grid>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Watch } from 'vue-property-decorator';
  import { Action, Getter, Mutation } from 'vuex-class';
  import { RawLocation } from 'vue-router';

  import * as Model from '@/types/typesModel';
  import * as Graph from '@/types/typesGraphs';
  import * as RGrid from '@/types/typesResizableGrid';
  import * as Donu from '@/types/typesDonu';

  import Counters from '@/components/Counters.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import SearchBar from '@/components/SearchBar.vue';

  import ModelPanel from '@/views/Simulation/components/ModelPanel.vue';
  import ParametersPanel from '@/views/Simulation/components/ParametersPanel.vue';
  import VariablesPanel from '@/views/Simulation/components/VariablesPanel.vue';
  import RunButton from '@/views/Simulation/components/RunButton.vue';

  const components = {
    Counters,
    ModelPanel,
    ParametersPanel,
    ResizableGrid,
    RunButton,
    SearchBar,
    VariablesPanel,
  };

  @Component({ components })
  export default class Simulation extends Vue {
    autoRun: boolean = false;
    runConfig: Donu.RequestConfig = { end: 120, start: 0, step: 30 };
    subgraph: Graph.GraphInterface = null;
    expandedId: string = '';

    @Action fetchModelResults;
    @Action incrNumberOfSavedRuns;
    @Action initializeSimParameters;
    @Action initializeSimVariables;
    @Action resetSim;
    @Getter getSelectedModelIds;
    @Getter getSimParameterArray;
    @Getter getModelsList;
    @Mutation setSelectedModels;

    @Watch('triggerFetchResults') onTriggerFetchResults (): void {
      if (this.autoRun) {
        this.fetchResults();
      }
    }

    @Watch('selectedModel') onModelChanged (): void {
      this.initializeSim();
    }

    mounted (): void {
      this.initializeSim();
    }

    /** Create an object that includes all variables that
     *  needs to trigger a refresh of the results. */
    get triggerFetchResults (): string {
      const { end, start, step } = this.runConfig;
      const watchObject = {
        config: { end, start, step },
        parameters: [...this.getSimParameterArray],
      };
      return JSON.stringify(watchObject);
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

    get gridMap (): string[][] {
      return this.expandedId
      ? [[this.expandedId]]
      : [
          ['model', 'div1', 'parameters', 'div2', 'variables'],
        ];
    }

    get gridDimensions (): RGrid.DimensionsInterface {
      return {
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

    onResetSim (): void {
      this.resetSim();
      this.initializeSim();
    }

    initializeSim (): void {
      if (this.selectedModel) {
        this.initializeSimParameters(this.selectedModel);
        this.initializeSimVariables(this.selectedModel);
      }
    }

    fetchResults (): void {
      if (this.selectedModel) {
        this.fetchModelResults({
          model: this.selectedModel,
          config: this.runConfig,
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

  .view-container {
    flex-direction: column;
    flex-grow: 1;
  }

  // Uniform sizing of the panels
  .simulation-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  // Uniform styling for the button in the settings-bars
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

  .search-col {
    display: flex;
    flex: 1;
  }

  .left-side-panel {
    flex-shrink: 0;
  }

  .form-check-label {
    color: $text-color-light;
  }
</style>
