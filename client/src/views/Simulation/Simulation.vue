<template>
  <div class="view-container">
    <header>
      <button
        class="btn btn-primary"
        :class="{ 'active': displaySearch }"
        @click="displaySearch = !displaySearch"
      >
        <font-awesome-icon :icon="['fas', 'search' ]" />
        <span>Search</span>
      </button>

      <button class="btn btn-primary">
        <font-awesome-icon :icon="['fas', 'project-diagram' ]" />
        <span>Provenance Graph</span>
      </button>

      <div class="runs-controls">
        <run-button
          :auto-run.sync="autoRun"
          :config.sync="runConfig"
          @run="fetchResults"
        />

        <div class="btn-group">
          <button
            class="btn btn-primary"
            title="Save current run"
            @click="incrNumberOfSavedRuns"
          >
            <font-awesome-icon :icon="['fas', 'bookmark' ]" />
          </button>
          <button
            class="btn btn-primary"
            title="Reset all saved runs"
            @click="onResetSim"
          >
            <font-awesome-icon :icon="['fas', 'undo' ]" />
          </button>
        </div>
      </div>

      <button class="btn btn-primary" @click="onCloseSimView">
        <font-awesome-icon :icon="['fas', 'sign-out-alt' ]" />
        <span> Close Simulation </span>
      </button>
    </header>

    <aside class="search-bar" :class="{ 'active': displaySearch }">
      <search-bar />
    </aside>

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
    displaySearch: boolean = false;
    expandedId: string = '';
    runConfig: Donu.RequestConfig = { end: 120, start: 0, step: 30 };
    subgraph: Graph.GraphInterface = null;

    @Action fetchModelResults;
    @Action incrNumberOfSavedRuns;
    @Action initializeSimParameters;
    @Action initializeSimVariables;
    @Action resetSim;
    @Getter getModelsList;
    @Getter getSelectedModelGraph
    @Getter getSelectedModelIds;
    @Getter getSimParameterArray;
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
        this.initializeSimParameters(this.selectedModel, this.getSelectedModelGraph);
        this.initializeSimVariables(this.selectedModel, this.getSelectedModelGraph);
      }
    }

    fetchResults (): void {
      if (this.selectedModel) {
        this.fetchModelResults({
          model: this.selectedModel,
          config: this.runConfig,
          selectedModelGraph: this.getSelectedModelGraph,
        });
      }
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

  .search-bar.settings-bar-container {
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
