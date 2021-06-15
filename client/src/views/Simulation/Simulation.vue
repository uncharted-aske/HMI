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
        <button class="btn btn-primary m-1" @click="fetchParameters">
          <span>Reset</span>
        </button>
        <button class="btn btn-primary m-1" @click="incrParametersMaxCount">
          <span>Save</span>
        </button>
      </div>
      <div class="search-col justify-content-end">
        <run-button class="m-1" :auto-run.sync="autoRun" @run="fetchVariables" />
        <button class="btn btn-primary m-1" @click="onCloseSimView">
          <font-awesome-icon :icon="['fas', 'chart-line' ]" />
          <span> Close Simulation View </span>
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
      <variable-panel
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

  import { SimulationParameter, ModelInterface } from '@/types/types';
  import { GraphInterface } from '@/types/typesGraphs';
  import { DimensionsInterface } from '@/types/typesResizableGrid';

  import { donuSimulateToD3 } from '@/utils/DonuUtil';
  import { getModelParameters } from '@/services/DonuService';

  import Counters from '@/components/Counters.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import SearchBar from '@/components/SearchBar.vue';

  import ModelPanel from '@/views/Simulation/components/ModelPanel.vue';
  import ParametersPanel from '@/views/Simulation/components/ParametersPanel.vue';
  import VariablePanel from '@/views/Simulation/components/VariablePanel.vue';
  import RunButton from '@/views/Simulation/components/RunButton.vue';

  const components = {
    Counters,
    ModelPanel,
    ParametersPanel,
    ResizableGrid,
    RunButton,
    SearchBar,
    VariablePanel,
  };

  @Component({ components })
  export default class Simulation extends Vue {
    autoRun: boolean = false;
    subgraph: GraphInterface = null;
    parameters: SimulationParameter[] = [];

    expandedId: string = '';

    @Action getModelResults;
    @Action incrParametersMaxCount;
    @Action setSimParameters;
    @Action setSimVariables;
    @Getter getSelectedModelIds;
    @Getter getSimParameterArray;
    @Getter getModelsList;
    @Mutation setSelectedModels;

    @Watch('selectedModel') onSelectedModelChanged (): void {
      this.fetchParameters();
    }

    @Watch('getSimParameterArray') onDonuParametersChanged (): void {
      if (this.autoRun) {
        this.fetchVariables();
      }
    }

    mounted (): void {
      this.fetchParameters();
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

    get gridMap (): string[][] {
      return this.expandedId
      ? [[this.expandedId]]
      : [
          ['model', 'div1', 'parameters', 'div2', 'variables'],
        ];
    }

    get gridDimensions (): DimensionsInterface {
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

    async fetchParameters (): Promise<void> {
      const simParameters = await getModelParameters(this.selectedModel) ?? [];
      const parameters: SimulationParameter[] = simParameters.map(donuParameter => ({
        ...donuParameter,
        hidden: false,
        values: [donuParameter.defaultValue],
      }));
      this.setSimParameters({ parameters, count: 1 });
    }

    async fetchVariables (): Promise<void> {
      if (this.selectedModel) {
        const responseArr: any = await this.getModelResults(this.selectedModel);
        this.setSimVariables(donuSimulateToD3(responseArr));
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
    background: $muted-highlight;
    border-color: $muted-highlight;
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
