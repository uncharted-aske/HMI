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
          :overlapping-elements="model.modelGraph[0].overlappingElements"
          :slot="('model_' + model.id)"
          :expandable="false"
          @highlight="onHighlight"
        />
      </template>
    </resizable-grid>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Getter, Mutation } from 'vuex-class';
  import { RawLocation } from 'vue-router';

  import * as Model from '@/types/typesModel';
  import * as Graph from '@/types/typesGraphs';
  import * as RGrid from '@/types/typesResizableGrid';

  import Counters from '@/components/Counters.vue';
  import Loader from '@/components/widgets/Loader.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import SearchBar from '@/components/SearchBar.vue';

  import ModelPanel from '@/views/Simulation/components/ModelPanel.vue';


  const MODEL_COMPARISON = {
    gamma: 'rec_u',
    I: 'I_U',
    R: 'R',
    S: 'S',
    beta: 'inf_uu',
  };

  const components = {
    Counters,
    Loader,
    ModelPanel,
    ResizableGrid,
    SearchBar,
  };

  @Component({ components })
  export default class Comparison extends Vue {
    displaySearch: boolean = false;
    highlighted: string = '';
    selectedModelForComparison: string = '';


    @Getter getSelectedModelGraphType;
    @Getter getModelsList;
    @Getter getSelectedModelIds;
    @Mutation setSelectedModels;

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
    
    onOpenSimView (): void {
      const options: RawLocation = { name: 'simulation' };
      options.params = {
          model_id: this.getSelectedModelIds.join(','),
      };

      this.$router.push(options);
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
