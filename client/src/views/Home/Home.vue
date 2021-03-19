<template>
  <div class="view-container">
    <left-side-panel :tabs="tabs" :activeTabId="activeTabId">
      <div slot="content">
        <facets-pane />
      </div>
    </left-side-panel>

    <div class="d-flex flex-column h-100">
      <div class="search-row">
        <search-bar :pills="searchPills" :placeholder="`Final test Quire`"/>
      </div>
      <settings-bar>
        <div slot="left">
          <counters :data="countersData"/>
        </div>
        <div slot="middle" class="view-button" v-if="selectedButtonContent">
          <button type="button" class="btn btn-primary h-100 d-flex align-items-center" @click="onClickCompare">
            {{selectedButtonContent}}
          </button>
        </div>
        <div slot="right">
          <settings/>
        </div>
      </settings-bar>
      <card-container
          class="model-cards"
          :header="`Models`"
          :cards="modelsCards"
          @click-card="onClickCard"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter, Mutation } from 'vuex-class';

  import { TabInterface, CardInterface } from '@/types/types';

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

    get countersData (): Array<string> {
      const modelsList = modelsService.fetchModels(this.getModelsList, this.getFilters);
      if (modelsList) {
        return [`${modelsList.length} Models`];
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

    get modelsCards (): CardInterface[] {
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
      if (this.getSelectedModelIds.length > 1) {
        this.$router.push({ name: 'comparison' });
      } else {
        const card = this.getModelsList.find(model => model.id === this.getSelectedModelIds[0]);
        this.$router.push({ name: card.type === 'computational' ? 'epi' : 'bio' });
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.view-button {
  padding: 2px 5px;
}

.model-cards ::v-deep .card {
  border: transparent solid 2px;
}

.model-cards ::v-deep .card.checked {
  border-color: $selection;
}
</style>
