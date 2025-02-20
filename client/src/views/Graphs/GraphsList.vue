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
          v-if="getSelectedKnowledgeGraph"
          class="btn btn-primary"
          slot="middle"
          type="button"
          @click="onClickView"
        >View</button>
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
  import LeukemiaScreenshot from '@/assets/img/graphs/leukemia.png';
  import COVID19Screenshot from '@/assets/img/graphs/covid_19.png';
  import BreastCancerScreenshot from '@/assets/img/graphs/breast_cancer.png';
  import LungCancerScreenshot from '@/assets/img/graphs/lung_adenocarcinoma.png';
  import MelanomaScreenshot from '@/assets/img/graphs/melanoma.png';
  import MultipleSclerosisScreenshot from '@/assets/img/graphs/multiple_sclerosis.png';
  import NeurofibromatosisScreenshot from '@/assets/img/graphs/neurofibromatosis.png';
  import PainMachineScreenshot from '@/assets/img/graphs/pain_machine.png';
  import PancreaticAdenocarcinomaScreenshot from '@/assets/img/graphs/pancreatic_adenocarcinoma.png';
  import ProstateAdenocarcinomaScreenshot from '@/assets/img/graphs/prostate_adenocarcinoma.png';
  import RasMachineScreenshot from '@/assets/img/graphs/ras_machine.png';
  import VitiligoScreenshot from '@/assets/img/graphs/vitiligo.png';
  import PlaceholderScreenshot from '@/assets/img/placeholder_image.png';

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
    @Getter getKnowledgeGraphsList;
    @Getter getSelectedKnowledgeGraph;
    @Mutation setSelectedKnowledgeGraph;

    get graphs (): KnowledgeGraph.Graph[] {
      return this.getKnowledgeGraphsList as KnowledgeGraph.Graph[];
      // const graphs = [...this.getKnowledgeGraphsList] as KnowledgeGraph.Graph[];
      // return graphs.filter(graph => !modelsService.isFiltered(graph, this.getFilters));
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
      const screenshots = [
        LeukemiaScreenshot,
        BreastCancerScreenshot,
        COVID19Screenshot,
        PlaceholderScreenshot,
        PlaceholderScreenshot,
        PlaceholderScreenshot,
        LungCancerScreenshot,
        PlaceholderScreenshot,
        MultipleSclerosisScreenshot,
        NeurofibromatosisScreenshot,
        PancreaticAdenocarcinomaScreenshot,
        PainMachineScreenshot,
        ProstateAdenocarcinomaScreenshot,
        RasMachineScreenshot,
        PlaceholderScreenshot,
        MelanomaScreenshot,
        VitiligoScreenshot,
      ];

      return this.graphs.map(graph => {
        return {
          id: graph.id,
          type: graph.metadata.type,
          previewImageSrc: screenshots[graph.id],
          title: graph.metadata.name,
          subtitle: graph.metadata.description,
          checked: this.getSelectedKnowledgeGraph === graph.id,
        };
      });
    }

    onClickCard (card: CardInterface): void {
      this.setSelectedKnowledgeGraph(card.id);
    }

    onClickView (): void {
      const options: RawLocation = { name: 'graph' };

      // As of now we only allow one Knowledgable Graph to be selected at a time.
      const selectedGraph: KnowledgeGraph.Graph = this.graphs.find(graph => graph.id === this.getSelectedKnowledgeGraph);
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

<style scoped>
  main {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
</style>
