<template>
  <div class="view-container">
    <!-- <left-side-panel
      class="left-side-panel"
      :activeTabId="activeTabId"
      :tabs="tabs"
    >
      <facets-pane slot="content" />
    </left-side-panel> -->
    <main>
      <div class="search-row">
        <search-bar :pills="searchPills" :placeholder="`Search for Graphs...`"/>
      </div>
      <settings-bar>
        <counters slot="left" :data="countersData"/>
        <button
          v-if="nbSelectedModelsIds > 0"
          class="btn btn-primary"
          slot="middle"
          type="button"
          @click="onClickView"
        >View</button>
        <settings slot="right"/>
      </settings-bar>
      <card-container
        class="graphs-cards"
        :cards="graphsCards"
        @click-card="onClickCard"
      />
    </main>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter, Mutation } from 'vuex-class';
  import { RawLocation } from 'vue-router';

  import { CardInterface, Counter, ModelInterface, TabInterface } from '@/types/types';

  import SearchBar from '@/components/SearchBar.vue';
  import Counters from '@/components/Counters.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Settings from './components/Settings.vue';
  import RangePill from '@/search/pills/RangePill';
  import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';

  import LeftSidePanel from '@/components/LeftSidePanel.vue';

  import FacetsPane from '@/views/Graphs/components/FacetsPane.vue';
  import CardContainer from '@/components/Cards/CardContainer.vue';

  // Screenshots
  import COVID19Screenshot from '@/assets/img/COVID19.png';

  // Services
  import * as modelsService from '@/services/ModelsService';

  const TABS: TabInterface[] = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
  ];

  const components = {
    CardContainer,
    Counters,
    FacetsPane,
    LeftSidePanel,
    SearchBar,
    Settings,
    SettingsBar,
  };

  @Component({ components })
  export default class GraphsList extends Vue {
    tabs: TabInterface[] = TABS;
    activeTabId: string = 'facets';

    @Getter getFilters;
    @Getter getModelsList;
    @Getter getSelectedModelIds;
    @Mutation setSelectedModels;
    @Mutation clearSelectedModels;

    mounted (): void {
      // As of now we do not compare Knowledge Graphs and Computationol Models.
      this.clearSelectedModels();
    }

    get graphs (): ModelInterface[] {
      return modelsService.fetchGraphs(this.getModelsList, this.getFilters);
    }

    get searchPills (): any {
      return [
        new RangePill(QUERY_FIELDS_MAP.HISTOGRAM),
      ];
    }

    get countersData (): Counter[] {
      if (this.graphs) {
        return [{ name: 'Graph(s)', value: this.graphs.length }];
      }
    }

    get nbSelectedModelsIds (): number {
      return this.getSelectedModelIds.length;
    }

    get graphsCards (): CardInterface[] {
      const selectedModelsList = new Set(this.getSelectedModelIds);
      return this.graphs.map(model => {
        return {
          id: model.id,
          type: model.type,
          previewImageSrc: COVID19Screenshot,
          title: model.metadata.name,
          subtitle: model.metadata.description,
          checked: selectedModelsList.has(model.id),
        } as CardInterface;
      });
    }

    onClickCard (card: CardInterface): void {
      // As of now we only allow one Knowledgable Graph to be selected at a time.
      this.clearSelectedModels();
      this.setSelectedModels(card.id);
    }

    onClickView (): void {
      // As of now we only allow one Knowledgable Graph to be selected at a time.
      const selectedModel: ModelInterface = this.graphs.find(graph => graph.id === this.getSelectedModelIds[0]);
      const modelId = selectedModel?.metadata?.id;

      if (modelId) {
        const options: RawLocation = {
          name: 'graph',
          params: {
            model_id: modelId.toString(),
          },
        };
        this.$router.push(options);
      }
    }
  }
</script>

<style lang="scss" scoped>
// .left-side-panel {
//   flex-shrink: 0;
// }

main {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
</style>
