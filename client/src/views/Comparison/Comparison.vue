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
      <settings
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
      <search-bar />
    </aside>

    <loader v-if="selectedModels.length < 1" loading="true" />
    <resizable-grid v-else :map="gridMap" :dimensions="gridDimensions">
      <template v-for="(model, index) in selectedModels">
        <model-panel
          class="comparison-panel"
          :key="index"
          :model="model"
          :slot="('model_' + model.id)"
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

  import * as Graph from '@/types/typesGraphs';
  import * as Model from '@/types/typesModel';
  import * as RGrid from '@/types/typesResizableGrid';

  import Counters from '@/components/Counters.vue';
  import Loader from '@/components/widgets/Loader.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import SearchBar from '@/components/SearchBar.vue';
  import Settings from '@/views/Models/components/Settings.vue';

  import ModelPanel from '@/views/Simulation/components/ModelPanel.vue';

  const components = {
    Counters,
    Loader,
    ModelPanel,
    ResizableGrid,
    SearchBar,
    Settings,
  };

  @Component({ components })
  export default class Comparison extends Vue {
    displaySearch: boolean = false;
    highlighted: string = '';
    selectedModelForComparison: string = '';

    layouts: Graph.GraphLayoutInterface[] = Graph.LAYOUTS;

    @Action initializeInterface;

    @Getter getSelectedModelGraphType;
    @Getter getModelsLayout;
    @Getter getModelsList;
    @Getter getSelectedModelIds;

    @Mutation setModelsLayout;
    @Mutation setSelectedModelGraphType;
    @Mutation setSelectedModels;

    @Watch('getSelectedModelGraphType') onModelGraphTypeChanged (): void {
      this.initializeSim();
    }

    mounted (): void {
      this.initializeSim();
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

      return this.getModelsList.filter(model => this.getSelectedModelIds.includes(model.id));
    }

    get gridMap (): string[][] {
      const gridMap: string[][] = [];

      this.selectedModels.forEach(model => {
        if (this.setSelectedModels) {
          gridMap.push([
            'model_' + model.id,
            'model-model-separator',
          ]);
        }
        // gridMap.push(['row-separator']);
      });

      return gridMap; // .slice(0, -1); // remove the last 'row-separator';
    }

    get gridDimensions (): RGrid.DimensionsInterface {
      return {
        'model-model-separator': {
          width: '1px',
          widthFixed: true,
        },
        'row-separator': {
          height: '10px',
          heightFixed: true,
        },
      };
    }

    get graphTypesAvailable (): Model.ViewInterface[] {
      if (!this.selectedModels) return [];

      // Get the list of all the graph types available in the selected model
      const graphTypesAvailable = [...new Set(this.selectedModels.map(model => {
        return model?.modelGraph.map(graph => graph.type);
      }).flat())];
      if (graphTypesAvailable.length === 0) return [];

      // Filter the constant and only display the available ones
      return Model.GRAPHTYPE_VIEWS.filter(view => {
        return graphTypesAvailable.includes(view.id);
      });
    }

    onOpenSimView (): void {
      const options: RawLocation = { name: 'simulation' };
      options.params = {
          model_ids: this.getSelectedModelIds.join(','),
      };

      this.$router.push(options);
    }

    initializeSim (): void {
      const selectedModelGraphType = this.getSelectedModelGraphType;
      if (this.selectedModels && selectedModelGraphType) {
        this.selectedModels.forEach(model => {
          this.initializeInterface({ model, selectedModelGraphType });
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
  .comparison-panel {
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
