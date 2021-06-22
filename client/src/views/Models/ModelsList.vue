<template>
  <div class="view-container">
    <main>
      <div class="search-row">
        <search-bar :pills="searchPills" :placeholder="`Search for Models...`"/>
      </div>
      <settings-bar>
        <counters slot="left" :data="countersData"/>
        <button
          v-if="nbSelectedModelsIds > 0"
          class="btn btn-primary"
          slot="middle"
          type="button"
          @click="onClickAction"
        >
          {{ nbSelectedModelsIds > 1 ? 'Compare' : 'View' }}
        </button>
        <settings slot="right"/>
      </settings-bar>
      <card-container
        class="models-cards"
        :cards="modelsCards"
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

  import FacetsPane from '@/views/Models/components/FacetsPane.vue';
  import CardContainer from '@/components/Cards/CardContainer.vue';

  // Screenshots
  import CHIMEScreenshot from '@/assets/img/CHIME.png';
  import SIRScreenshot from '@/assets/img/SIR.png';
  import DoubleEpiScreenshot from '@/assets/img/DoubleEpi.png';

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
  export default class ModelsList extends Vue {
    tabs: TabInterface[] = TABS;
    activeTabId: string = 'facets';

    @Getter getFilters;
    @Getter getModelsList;
    @Getter getSelectedModelIds;
    @Mutation setSelectedModels;
    @Mutation clearSelectedModels;

    get models (): ModelInterface[] {
      console.log(this.getModelsList);
      return this.getModelsList;
    }

    get searchPills (): any {
      return [
        new RangePill(QUERY_FIELDS_MAP.HISTOGRAM),
      ];
    }

    get countersData (): Counter[] {
      if (this.models) {
        return [{ name: 'Computational Model(s)', value: this.models.length }];
      }
    }

    get nbSelectedModelsIds (): number {
      return this.getSelectedModelIds.length;
    }

    get modelsCards (): CardInterface[] {
      const selectedModelsList = new Set(this.getSelectedModelIds);
      return this.models.map(model => {
        // Screenshot as placeholder for UX image
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
        }

        return {
          id: model.id,
          previewImageSrc,
          title: model.name,
          subtitle: model.metadata.description, 
          checked: selectedModelsList.has(model.id),
        } as CardInterface;
      });
    }

    onClickCard (card: CardInterface): void {
      this.setSelectedModels(card.id);
    }

    onClickAction (): void {
      const options: RawLocation = {};
      if (this.nbSelectedModelsIds > 1) {
        options.name = 'comparison';
      } else {
        options.name = 'model';

        const selectedModel: ModelInterface = this.models.find(model => model.id === this.getSelectedModelIds[0]);
        if (selectedModel) {
          options.params = {
            model_id: selectedModel.id.toString(),
          };
        }
      }
      this.$router.push(options);
    }
  }
</script>

<style lang="scss" scoped>
main {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
</style>
