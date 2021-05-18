<template>
  <div class="view-container">
    <left-side-panel
      class="left-side-panel"
      :activeTabId="activeTabId"
      :tabs="tabs"
    >
      <facets-pane slot="content" />
    </left-side-panel>
    <div class="d-flex flex-column h-100">
      <div class="search-row">
        <search-bar :pills="searchPills" :placeholder="`Search for Graphs...`"/>
      </div>
      <settings-bar>
        <counters slot="left" :data="countersData"/>
        <button
          v-if="selectedButtonContent"
          class="btn btn-primary"
          slot="middle"
          type="button"
          @click="onClickCompare"
        >
          {{ selectedButtonContent }}
        </button>
        <settings slot="right"/>
      </settings-bar>
      <card-container
        class="graphs-cards"
        :cards="graphsCards"
        :header="`Graphs`"
        @click-card="onClickCard"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter, Mutation } from 'vuex-class';

  import { CardInterface, Counter, TabInterface } from '@/types/types';

  import SearchBar from '@/components/SearchBar.vue';
  import Counters from '@/components/Counters.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Settings from './components/Settings.vue';
  import KeyValuePill from '@/search/pills/KeyValuePill';
  import RangePill from '@/search/pills/RangePill';
  import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
  import * as modelTypeUtil from '@/utils/ModelTypeUtil';

  import LeftSidePanel from '@/components/LeftSidePanel.vue';

  import FacetsPane from './components/FacetsPane.vue';
  import CardContainer from '@/components/Cards/CardContainer.vue';

  // Screenshots
  import CHIMEScreenshot from '@/assets/img/CHIME.png';
  import SIRScreenshot from '@/assets/img/SIR.png';
  import DoubleEpiScreenshot from '@/assets/img/DoubleEpi.png';
  import COVID19Screenshot from '@/assets/img/COVID19.png';

  // Services
  import * as modelsService from '@/services/ModelsService';

  const TABS: TabInterface[] = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
  ];

  const components = {
    SearchBar,
    Counters,
    SettingsBar,
    Settings,
    LeftSidePanel,
    FacetsPane,
    CardContainer,
  };

  @Component({ components })
  export default class Home extends Vue {
    tabs: TabInterface[] = TABS;
    activeTabId: string = 'facets';

    @Getter getFilters;
    @Getter getModelsList;
    @Getter getSelectedModelIds;
    @Mutation setSelectedModels;

    get searchPills (): any {
      return [
        new KeyValuePill(
          QUERY_FIELDS_MAP.MODEL_TYPE,
          modelTypeUtil.MODEL_TYPE_OPTIONS,
          'Select model type..',
        ),
        new RangePill(QUERY_FIELDS_MAP.HISTOGRAM),
      ];
    }

    get countersData (): Array<Counter> {
      const modelsList = modelsService.fetchModels(this.getModelsList, this.getFilters);
      if (modelsList) {
        return [{ name: 'Models', value: modelsList.length }];
      }
    }

    get selectedButtonContent (): string {
      const selectedModelIdLength = this.getSelectedModelIds.length;
      if (selectedModelIdLength === 0) {
        return '';
      } else if (selectedModelIdLength === 1) {
        return 'View';
      } else {
        return 'Compare';
      }
    }

    get graphsCards (): CardInterface[] {
      const modelsList = modelsService.fetchModels(this.getModelsList, this.getFilters);
      const selectedModelsList = new Set(this.getSelectedModelIds);
      const modelsCards = modelsList.map(model => {
        let previewImageSrc = null;
        switch (model.id) {
        case 0:
            previewImageSrc = SIRScreenshot;
            break;
          case 1:
            previewImageSrc = CHIMEScreenshot;
            break;
          case 2:
            previewImageSrc = DoubleEpiScreenshot;
            break;
          default:
            previewImageSrc = COVID19Screenshot;
        }
        return Object.assign({}, model, { previewImageSrc, title: model.metadata.name, subtitle: model.metadata.description, checked: selectedModelsList.has(model.id) });
      });
      return modelsCards;
    }

    onClickCard (card: CardInterface): void {
      this.setSelectedModels(card.id);
    }

    onClickCompare (): void {
      const name = this.getSelectedModelIds.length > 1 ? 'comparison' : 'graphs';
      this.$router.push({ name });
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.left-side-panel {
  flex-shrink: 0;
}
</style>
