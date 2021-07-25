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

      <button class="btn btn-primary">
        <font-awesome-icon :icon="['fas', 'project-diagram' ]" />
        Provenance Graph
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

    <loader v-if="selectedModels.length < 1" loading="true" />
    <resizable-grid v-else :map="gridMap" :dimensions="gridDimensions">
      <template v-for="(model, index) in selectedModels">
        <model-panel
          class="simulation-panel"
          :expanded="expandedId === 'model'"
          :key="index"
          :model="model"
          :slot="('model_' + index)"
          @expand="setExpandedId('model')"
        />
        <parameters-panel
          class="simulation-panel"
          :expanded="expandedId === 'parameters'"
          :key="index"
          :modelId="model.id"
          :slot="('parameters_' + index)"
          @expand="setExpandedId('parameters')"
        />
        <variables-panel
          class="simulation-panel"
          :expanded="expandedId === 'variables'"
          :key="index"
          :modelId="model.id"
          :slot="('variables_' + index)"
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

  const components = {
    Counters,
    Loader,
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
    @Action initializeParameters;
    @Action initializeVariables;
    @Action resetSim;
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
      const allParameters = [];
      // this.getSelectedModelIds.map(modelId => {
      //   const modelParameters = this.getSimParameterArray?.[Number(modelId)] ?? [];
      //   modelParameters.foreach(allParameters.push);
      // });
      // console.table(allParameters);
      const watchObject = {
        config: { end, start, step },
        parameters: allParameters,
      };
      return JSON.stringify(watchObject);
    }

    get selectedModels (): Model.Model[] {
      if (
        this.getSelectedModelIds.length < 1 && // Are we missing the selectedModelId, toString to test id 0 as well,
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

      this.selectedModels.forEach((model, index) => {
        if (this.expandedId) {
          gridMap.push([this.expandedId + '_' + index]);
        } else if (this.setSelectedModels) {
          gridMap.push([
            'model_' + index,
            'model-parameters-separator',
            'parameters_' + index,
            'parameters-variables-separator',
            'variables_' + index,
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
