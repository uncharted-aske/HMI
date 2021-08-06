<template>
  <div class="view-container">
    <loader v-if="modelsCards.length < 1" loading="true" />
    <main v-else>
      <div class="search-row">
        <search-bar :pills="searchPills" :placeholder="`Search for Models...`"/>
      </div>
      <settings-bar>
        <counters slot="left" :data="countersData"/>
        <div slot="right">
          <button
            v-if="nbSelectedModelsIds > 0"
            class="btn btn-primary"
            type="button"
            @click="onClickAction"
          >
            {{ nbSelectedModelsIds > 1 ? 'Compare' : 'Open' }}
          </button>
        </div>
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
  import { Action, Getter, Mutation } from 'vuex-class';
  import { RawLocation } from 'vue-router';

  import { CardInterface, Counter, TabInterface } from '@/types/types';
  import * as Model from '@/types/typesModel';

  import SearchBar from '@/components/SearchBar.vue';
  import Counters from '@/components/Counters.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Settings from './components/Settings.vue';
  import RangePill from '@/search/pills/RangePill';
  import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';

  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import Loader from '@/components/widgets/Loader.vue';

  import FacetsPane from '@/views/Models/components/FacetsPane.vue';
  import CardContainer from '@/components/Cards/CardContainer.vue';

  // Screenshots
  import SIRScreenshot from '@/assets/img/SIR.png';
  import SEIRScreenshot from '@/assets/img/SEIR.png';
  import SEIRDScreenshot from '@/assets/img/SEIRD.png';
  import SIRDScreenshot from '@/assets/img/SIRD.png';
  import SpatialSIRDScreenshot from '@/assets/img/SpatialSIRD.png';

  const TABS: TabInterface[] = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
  ];

  const components = {
    CardContainer,
    Counters,
    FacetsPane,
    LeftSidePanel,
    Loader,
    SearchBar,
    Settings,
    SettingsBar,
  };

  @Component({ components })
  export default class ModelsList extends Vue {
    tabs: TabInterface[] = TABS;
    activeTabId: string = 'facets';

    @Action resetSelectedModelIds;
    @Getter getFilters;
    @Getter getModelsList;
    @Getter getSelectedModelIds;
    @Mutation setSelectedModels;

    activated (): void {
      this.resetSelectedModelIds();
    }

    get models (): Model.Model[] {
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
      function getModelsPreviewImageSource (model) {
        if (['SimpleSIR', 'SimpleSIR_metadata'].includes(model.name)) {
          return SIRScreenshot;
        } else if (model.name === 'SimpleSIRD') {
          return SIRDScreenshot;
        } else if (model.name === 'SimpleSEIR') {
          return SEIRScreenshot;
        } else if (model.name === 'SimpleSEIRD') {
          return SEIRDScreenshot;
        } else if (model.name === 'SimpleSpatialSIRD') {
          return SpatialSIRDScreenshot;
        }
      }
      return this.models.map(model => {
        const previewImageSrc = getModelsPreviewImageSource(model);
        return {
          id: model.id,
          previewImageSrc,
          title: model.name ?? 'No Title',
          subtitle: model.metadata?.description ?? 'No Subtitle',
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

        const selectedModel: Model.Model = this.models.find(model => model.id === this.getSelectedModelIds[0]);
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

<style scoped>
  main {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
</style>
