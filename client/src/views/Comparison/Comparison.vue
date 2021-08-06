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
    </header>

    <aside class="search-bar" :class="{ 'active': displaySearch }">
      <search-bar />
    </aside>

    <loader v-if="selectedModels.length < 1" loading="true" />
    <!-- <resizable-grid v-else :map="gridMap" :dimensions="gridDimensions">
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
      </template>
    </resizable-grid> -->
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

  import Counters from '@/components/Counters.vue';
  import Loader from '@/components/widgets/Loader.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import SearchBar from '@/components/SearchBar.vue';

  import ModelPanel from '@/views/Simulation/components/ModelPanel.vue';
  
  const components = {
    Counters,
    Loader,
    ModelPanel,
    ResizableGrid,
    SearchBar,
  };

  @Component({ components })
  export default class Simulation extends Vue {
    displaySearch: boolean = false;
    expandedId: string = '';
    subgraph: Graph.GraphInterface = null;
    highlighted: string = '';

    
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

    onNodeHighlight (label: string): void {
      this.highlighted = label;
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
