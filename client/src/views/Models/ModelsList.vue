<template>
  <div class="view-container">
    <main>
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
          <button
            v-if="nbSelectedModelsIds > 1"
            class="btn btn-primary"
            type="button"
            @click="onClickSimulation"
          >
            {{ 'Open Multiple Simulation' }}
          </button>
        </div>
      </settings-bar>
      <card-container v-if="!dataLoading"
        class="models-cards"
        :cards="modelsCards"
        @click-card="onClickCard"
      />
      <loader :loading="dataLoading" />
    </main>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Watch } from 'vue-property-decorator';
  import { Action, Getter, Mutation } from 'vuex-class';
  import { RawLocation } from 'vue-router';

  import { queryDonuModels } from '@/services/DonuService';

  import { CardInterface, Counter, TabInterface } from '@/types/types';
  import { Filters } from '@/types/typesLex';
  import * as Model from '@/types/typesModel';

  import SearchBar from '@/components/SearchBar.vue';
  import Counters from '@/components/Counters.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Settings from './components/Settings.vue';
  import TextPill from '@/search/pills/TextPill';
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
    allowModelSourceList: string[] = []; // Models that should not be filtered
    dataLoading: boolean = true; // Toggles loading screen
    models: Model.Model[] = [];

    @Action resetSelectedModelIds;
    @Getter getFilters;
    @Getter getModelsList;
    @Getter getSelectedModelIds;
    @Mutation setSelectedModels;

    @Watch('getFilters') onGetFiltersChanged (newFilters: Filters): void {
      this.handleFiltersChanged(newFilters);
    }

    @Watch('getModelsList') onGetModelsListChanged (): void {
      this.setModels();
    }

    created (): void {
      this.setModels();
    }

    activated (): void {
      this.resetSelectedModelIds();
    }

    async handleFiltersChanged (newFilters: Filters): Promise<void> {
      if (newFilters.clauses.length > 0) {
        this.dataLoading = true;
        const text = newFilters.clauses.find(clause => clause.field === QUERY_FIELDS_MAP.MODELS_TEXT_SEARCH.field)?.values[0] as string;
        const models = await queryDonuModels(text);
        this.allowModelSourceList = models.map(m => m.source.model);
      }
      this.setModels();
    }

    setModels (): void {
      if (this.getModelsList.length === 0) {
        // Models have not been loaded in store yet
        this.models = [];
      } else if (this.getModelsList.length > 0 && this.getFilters.clauses.length === 0) {
        // No Query present: return full model list
        this.models = this.getModelsList;
        this.dataLoading = false;
      } else {
        // Query present: filter models based on model sources returned in query results
        const models = this.getModelsList.filter(m => {
          return m.modelGraph.find(d => this.allowModelSourceList.includes(d.model));
        });
        this.models = models;
        this.dataLoading = false;
      }
    }

    get searchPills (): any {
      return [
        new TextPill(QUERY_FIELDS_MAP.MODELS_TEXT_SEARCH),
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

    onClickSimulation (): void {
      const options: RawLocation = { name: 'simulation' };
      options.params = {
        model_id: this.getSelectedModelIds.join(','),
      };
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
