<template>
  <div class="view-container">
    <left-side-panel :tabs="tabs" :activeTabId="activeTabId">
      <div slot="content">
        <facets-pane />
      </div>
    </left-side-panel>

    <div class="content">
      <search-bar />
      <start-screen
          :open-section-header="`Models`"
          :cards="modelsCards"
          @open-card="onOpenCard"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter, Mutation } from 'vuex-class';

  import { TabInterface } from '@/types/types';
  import { CardInterface } from './types/types';

  import SearchBar from './components/SearchBar/SearchBar.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';

  import FacetsPane from './components/FacetsPane/FacetsPane.vue';
  import StartScreen from './components/StartScreen/StartScreen.vue';

  // Screenshots
  import CHIMEScreenshot from '@/assets/img/CHIME.png';
  import SIRScreenshot from '@/assets/img/SIR.png';
  import DoubleEpiScreenshot from '@/assets/img/DoubleEpi.png';

  // Services
  import * as modelsService from '@/services/ModelsService';

  const TABS: TabInterface[] = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
  ];

  const components = {
    SearchBar,
    LeftSidePanel,
    FacetsPane,
    StartScreen,
  };

  @Component({ components })
  export default class Home extends Vue {
    tabs: TabInterface[] = TABS;
    activeTabId: string = 'facets';

    @Getter getFilters;
    @Getter getModelsList;
    @Mutation setSelectedModel;

    get modelsCards (): CardInterface[] {
      const modelsList = modelsService.fetchModels(this.getModelsList, this.getFilters);
      const modelsCards = modelsList.map(model => {
        let previewImageSrc = null;
        switch (model.id) {
        case 1:
            previewImageSrc = CHIMEScreenshot;
            break;
          case 2:
            previewImageSrc = SIRScreenshot;
            break;
          case 3:
            previewImageSrc = DoubleEpiScreenshot;
            break;
          default:
            previewImageSrc = null;
        }
        return Object.assign({}, model, { previewImageSrc, title: model.metadata.name, subtitle: model.metadata.source });
      });
      return modelsCards;
    }

    onOpenCard (card: CardInterface): void {
      const view = card.type === 'computational' ? 'epiView' : 'bioView';
      this.setSelectedModel(card.id);
      this.$router.push({ name: view });
    }
  }
</script>

<style lang="scss" scoped>
</style>
