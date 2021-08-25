<template>
  <div class="view-container">
    <loader v-if="selectedModels.length < 1" loading="true" />
    <section v-else>
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

      <resizable-grid :map="gridMap" :dimensions="gridDimensions">
        <template v-for="(model, index) in selectedModels">
          <model-panel
            class="comparison-panel"
            :key="index"
            :model="model"
            :slot="('model_' + model.id)"
            @node-click="onNodeClick"
          />
        </template>
      </resizable-grid>
    </section>

    <drilldown-panel
      class="drilldown-panel-model"
      :active-tab-id="drilldownActiveTabId"
      :is-open="drilldownActiveTabId"
      :pane-subtitle="drilldownPaneSubtitle"
      :pane-title="drilldownPaneTitle"
      :tabs="drilldownTabs"
      @close-pane="drilldownActiveTabId = ''"
      @tab-click="tabId => drilldownActiveTabId = tabId"
    >
      <metadata-pane
        v-if="drilldownActiveTabId === 'metadata'"
        slot="content"
        :metadata="drilldownMetadata"
        :model-name="selectedModel.name"
      />
      <parameters-pane
        v-if="drilldownActiveTabId === 'parameters'"
        slot="content"
        :related="drilldownRelatedParameters"
      />
      <knowledge-pane
        v-if="drilldownActiveTabId === 'knowledge'"
        slot="content"
        :data="drilldownKnowledge"
      />
    </drilldown-panel>
  </div>
</template>

<script lang="ts">
  import { merge } from 'lodash';
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Watch } from 'vue-property-decorator';
  import { Action, Getter, Mutation } from 'vuex-class';
  import { RawLocation } from 'vue-router';

  import * as HMI from '@/types/types';
  import * as GroMEt from '@/types/typesGroMEt';
  import * as Graph from '@/types/typesGraphs';
  import * as Model from '@/types/typesModel';
  import * as RGrid from '@/types/typesResizableGrid';
  import * as Cosmos from '@/types/typesCosmos';

  import Counters from '@/components/Counters.vue';
  import Loader from '@/components/widgets/Loader.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import SearchBar from '@/components/SearchBar.vue';
  import Settings from '@/views/Models/components/Settings.vue';
  import ModelPanel from '@/views/Simulation/components/ModelPanel.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import MetadataPane from '@/views/Models/components/DrilldownPanel/MetadataPane.vue';
  import KnowledgePane from '@/views/Models/components/DrilldownPanel/KnowledgePane.vue';
  import ParametersPane from '@/views/Models/components/DrilldownPanel/ParametersPane.vue';

  import { cosmosRelatedParameters, cosmosSearch } from '@/services/CosmosFetchService';
  import { filterToParamObj } from '@/utils/CosmosDataUtil';

  const components = {
    Counters,
    Loader,
    ModelPanel,
    ResizableGrid,
    SearchBar,
    Settings,
    DrilldownPanel,
    MetadataPane,
    KnowledgePane,
    ParametersPane,
  };

  @Component({ components })
  export default class Comparison extends Vue {
    displaySearch: boolean = false;
    selectedModelForComparison: string = '';
    drilldownActiveTabId: string = '';
    drilldownPaneTitle = '';
    drilldownPaneSubtitle = '';
    drilldownMetadata: any = null;
    drilldownKnowledge: Cosmos.CosmosSearchInterface | Record<any, never> = {};
    drilldownRelatedParameters: any = null;

    layouts: Graph.GraphLayoutInterface[] = Graph.LAYOUTS;

    @Action initializeInterface;
    @Action resetSim;

    @Getter getSelectedModelGraphType;
    @Getter getModelsLayout;
    @Getter getModelsList;
    @Getter getSelectedModelIds;
    @Getter getSelectedNodesData;

    @Mutation setModelsLayout;
    @Mutation setSelectedModelGraphType;
    @Mutation setSelectedModels;

    @Watch('getSelectedModelGraphType') onModelGraphTypeChanged (): void {
      this.resetSim(); // We only save simulation info per model.id, not model.id + graph type.
      this.initializeSim();
    }

    mounted (): void {
      this.initializeSim();
    }

    onNodeClick (node: Graph.GraphNodeInterface): void {
      if (node) {
        // Select which tab should be open first, then open the drilldown.
        this.drilldownActiveTabId = 'metadata';

        // Merge node metadata with Variables metadata. c.f. Graph.GraphNodeInterface type
        this.drilldownMetadata = node?.metadata ? node.metadata.flat() : null;

        this.drilldownPaneSubtitle = `${node.nodeType} (${node.dataType})`;
        this.drilldownPaneTitle = node.label;
        this.getDrilldownKnowledge();
        this.getRelatedParameters(node.label);
      } else {
        this.drilldownActiveTabId = '';
      }
    }

    async getRelatedParameters (keyword: string): Promise<void> {
      const response = await cosmosRelatedParameters({ word: keyword, model: 'trigram', n: 10 });
      this.drilldownRelatedParameters = response.data;
    }

    get drilldownTabs (): HMI.TabInterface[] {
      return [
        { name: 'Metadata', icon: '', id: 'metadata' },
        { name: 'Parameters', icon: '', id: 'parameters' },
        { name: 'Knowledge', icon: '', id: 'knowledge' },
      ];
    }

    get selectedModel (): any {
      return this.getSelectedNodesData[0] ?? {};
    }

    get selectedGraphMetadata (): Model.GraphMetadata[] {
      return this.selectedModel?.metadata ?? null;
    }

    get selectedGraph (): Graph.GraphInterface {
      return this.selectedModel?.graph ?? null;
    }

    async getDrilldownKnowledge (): Promise<void> {
      if (this.selectedGraphMetadata?.constructor === Array) {
        const codeCollection = this.selectedGraphMetadata.find(metadata => {
          return metadata.metadata_type === GroMEt.MetadataType.CodeCollectionReference;
        }) as GroMEt.CodeCollectionInterface;

        if (codeCollection?.global_reference_id?.id) {
          this.drilldownKnowledge = merge(this.drilldownKnowledge, await cosmosSearch(filterToParamObj({
            cosmosAskeId: codeCollection.global_reference_id.id,
          })));
        }

        const textualDocumentReference = this.selectedGraphMetadata.find(metadata => {
          return metadata.metadata_type === GroMEt.MetadataType.TextualDocumentReferenceSet;
        }) as GroMEt.TextualDocumentReferenceSet;

        if (textualDocumentReference?.documents?.length) {
          this.drilldownKnowledge = merge(this.drilldownKnowledge, await cosmosSearch(filterToParamObj({
            cosmosAskeId: textualDocumentReference.documents[0].global_reference_id.id,
          })));
        }

        if (this.drilldownKnowledge.objects) {
          delete this.drilldownKnowledge.error;
        }
      }
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
  .view-container section {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    position: relative;
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
