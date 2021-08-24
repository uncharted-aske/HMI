<template>
  <div class="view-container">
    <header>
      <button
        class="btn btn-primary"
        :class="{ 'active': displaySearch }"
        @click="displaySearch = !displaySearch"
      >
        <font-awesome-icon :icon="['fas', 'search' ]" />
        Search
      </button>
    </header>

    <aside class="search-bar" :class="{ 'active': displaySearch }">
      <search-bar :pills="searchPills" :placeholder="`Search for Models...`"/>
    </aside>

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

    <loader v-if="dataLoading" loading="true" />
    <card-container
      v-else
      class="models-cards"
      :cards="modelsCards"
      @click-card="onClickCard"
    />
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
  import ChimeScreenshot from '@/assets/img/models/CHIME_SIR.png';
  import ChimeSIRBaseScreenshot from '@/assets/img/models/CHIME_SIR_Base.png';
  import ChimePlusScreenshot from '@/assets/img/models/SimpleChime+.png';
  import SIRScreenshot from '@/assets/img/models/SimpleSIR.png';
  import SEIRScreenshot from '@/assets/img/models/SimpleSEIR.png';
  import SEIRDScreenshot from '@/assets/img/models/SimpleSEIRD.png';
  import SIRDScreenshot from '@/assets/img/models/SimpleSIRD.png';
  import SpatialSIRDScreenshot from '@/assets/img/models/SimpleSpatialSIRD.png';
  import MarmScreenshot from '@/assets/img/models/marm_model.png';
  import Covid19Screenshot from '@/assets/img/models/covid19_inflammasome.png';
  import PlaceholderScreenshot from '@/assets/img/placeholder_image.png';

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
    displaySearch: boolean = false; // Toggles search bar
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
      } else {
        // Query present: filter models based on model sources returned in query results
        const models = this.getModelsList.filter(m => {
          return m.modelGraph.find(d => this.allowModelSourceList.includes(d.model));
        });
        this.models = models;
      }
      this.dataLoading = false;
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
        } else if (model.name === 'marm_model') {
          return MarmScreenshot;
        } else if (model.name === 'covid19_inflammasome') {
          return Covid19Screenshot;
        } else if (model.name === 'CHIME_SIR') {
          return ChimeScreenshot;
        } else if (model.name === 'CHIME_SIR_Base') {
          return ChimeSIRBaseScreenshot;
        } else if (model.name === 'SimpleChime+') {
          return ChimePlusScreenshot;
        } else return PlaceholderScreenshot;
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
        options.params = {
          model_ids: this.getSelectedModelIds.join(','),
        };
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
  .view-container {
    flex-direction: column;
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

  .search-bar {
    background-color: var(--bg-secondary);
    flex-shrink: 0;
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
</style>
