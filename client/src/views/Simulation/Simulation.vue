<template>
  <div class="view-container">
    <div class="d-flex flex-column flex-grow-1 position-relative">
      <div class="search-row">
        <div class="search-col flex-column">
          <search-bar />
        </div>
        <div class="search-col mx-3 justify-content-between">
          <button class="btn btn-primary blue m-1">
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
          <button class="btn btn-primary blue m-1" @click="onCloseSimView">
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
            <button slot="right" type="button" class="btn btn-primary" @click="setExpandedId('model')">
              <i class="fas fa-expand-alt"/>
            </button>
          </settings-bar>
          <global-graph v-if="selectedModel" :data="selectedGraph"/>
        </div>
        <simulation-parameters
          slot="parameters" class="h-100 w-100 d-flex flex-column"
          :donu-parameters="parameters"
          :expanded="expandedId === 'parameters'"
          @settings="onCloseSimView"
          @expand="setExpandedId('parameters')"
        />
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
              <button type="button" class="btn btn-primary" @click="onCloseSimView">Settings</button>
              <button type="button" class="btn btn-primary" @click="setExpandedId('variables')">
                <i class="fas fa-expand-alt"/>
              </button>
            </div>
          </settings-bar>
          <global-graph v-if="selectedModel" :data="selectedGraph"/>
        </div>
      </resizable-grid>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Watch } from 'vue-property-decorator';
  import { Getter, Mutation } from 'vuex-class';
  import { RawLocation } from 'vue-router';

  import { TabInterface, ViewInterface, ModelInterface } from '@/types/types';
  import { GraphInterface } from '@/types/typesGraphs';
  import * as Donu from '@/types/typesDonu';
  import { DimensionsInterface } from '@/types/typesResizableGrid';

  import { getModelParameters } from '@/services/DonuService';

  import Counters from '@/components/Counters.vue';
  import FacetsPane from '@/views/Models/components/FacetsPane.vue';
  import GlobalGraph from '@/views/Models/components/Graphs/GlobalGraph.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import Settings from '@/views/Models/components/Settings.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import SearchBar from '@/components/SearchBar.vue';
  import SimulationParameters from '@/views/Simulation/components/SimulationParameters.vue';

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

  const components = {
    Counters,
    FacetsPane,
    GlobalGraph,
    ResizableGrid,
    SearchBar,
    Settings,
    SettingsBar,
    SimulationParameters,
  };

  @Component({ components })
  export default class Model extends Vue {
    views: ViewInterface[] = VIEWS;
    selectedViewId = 'causal';

    tabs: TabInterface[] = TABS;
    activeTabId: string = 'metadata';

    subgraph: GraphInterface = null;
    parameters: Donu.ModelParameter[] = [];

    expandedId: string = '';

    @Getter getSelectedModelIds;
    @Getter getModelsList;
    @Mutation setSelectedModels;

    @Watch('selectedModel') onSelectedModelChanged (): void {
      this.fetchParameters();
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

    get selectedGraph (): GraphInterface {
      return this.selectedViewId === 'causal' ? this.selectedModel?.graph?.abstract : this.selectedModel?.graph?.detailed;
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
      this.parameters = await getModelParameters(this.selectedModel) ?? [];
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

  // Uniform styling for the button in the settings-bars
  .view-container::v-deep .settings-bar-container button {
    height: 2em;
    line-height: 0;
    padding-bottom: 0;
    padding-top: 0;
  }

  .btn-primary.blue {
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
</style>
