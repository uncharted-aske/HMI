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
          v-if="getSelectedGraph"
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

  import { CardInterface, Counter, TabInterface } from '@/types/types';
  import * as KnowledgeGraph from '@/types/typesKnowledgeGraph';

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
    @Getter getSelectedGraph;
    @Mutation setSelectedGraph;
    @Mutation clearSelectedModels;

    get graphs (): KnowledgeGraph.Graph[] {
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

    get graphsCards (): CardInterface[] {
      return this.graphs.map(graph => {
        return {
          id: graph.id,
          type: graph.metadata.type,
          previewImageSrc: COVID19Screenshot,
          title: graph.metadata.name,
          subtitle: graph.metadata.description,
          checked: this.getSelectedGraph === graph.id,
        };
      });
    }

    onClickCard (card: CardInterface): void {
      this.setSelectedGraph(card.id);
    }

    onClickView (): void {
      const options: RawLocation = { name: 'graph' };

      // As of now we only allow one Knowledgable Graph to be selected at a time.
      const selectedGraph: KnowledgeGraph.Graph = this.graphs.find(graph => graph.id === this.getSelectedGraph);
      const modelId = selectedGraph?.metadata?.id;
      if (modelId) {
        options.params = {
          model_id: modelId.toString(),
        };
      }

      this.$router.push(options);
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
