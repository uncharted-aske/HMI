<template>
  <div class="view-container">
    <div class="d-flex flex-column h-100">
      <div class="search-row">
        <search-bar :pills="searchPills" :placeholder="`Search for documents including a specific keyword (e.g. IL-6)...`" />
      </div>
      <settings-bar>
        <div slot="left">
          <counters :data="countersData"/>
        </div>
        <div slot="right">
          <settings />
        </div>
      </settings-bar>
      <card-container
          :header="`Knowledge`"
          :cards="docsCards"
          @click-card="onCardClick"
      />
      <loader :loading="dataLoading">
    </div>
    <drilldown-panel :tabs="drilldownTabs" :is-open="isOpenDrilldown" :active-tab-id="drilldownActiveTabId" @close-pane="onCloseDrilldownPanel" @tab-click="onDrilldownTabClick">
        <knowledge-preview-pane v-if="drilldownActiveTabId ===  'preview'" slot="content" :data="drilldownData" @open-modal="showModalDocuments = true"/>
        <models-pane v-if="drilldownActiveTabId ===  'models'" slot="content" :data="drilldownData"/>
        <entities-pane v-if="drilldownActiveTabId ===  'entities'" slot="content" :data="drilldownData"/>
    </drilldown-panel>
    <modal-document
      v-if="showModalDocuments"
      @close="showModalDocuments = false"
      :data="drilldownData"
    />

  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import { Watch } from 'vue-property-decorator';
  import Vue from 'vue';
  import { Getter } from 'vuex-class';
  import _ from 'lodash';

  import { CosmosSearchInterface, CosmosSearchObjectsInterface } from '@/types/typesCosmos';
  import { FacetTermsSelectionMap } from '@/types/typesFacets';
  import { TabInterface, CardInterface } from '@/types/types';

  import SearchBar from '@/components/SearchBar.vue';
  import TextPill from '@/search/pills/TextPill';
  import KeyValuePill from '@/search/pills/KeyValuePill';
  import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
  import * as modelTypeUtil from '@/utils/ModelTypeUtil';

  import * as filtersUtil from '@/utils/FiltersUtil';
  import { cosmosSearch } from '@/services/CosmosFetchService';
  import { filterToParamObj, getAuthorList } from '@/utils/CosmosDataUtil';

  import Loader from '@/components/widgets/Loader.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Settings from '../components/Settings.vue';
  import Counters from '@/components/Counters.vue';
  import CardContainer from '@/components/Cards/CardContainer.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import KnowledgePreviewPane from '../components/DrilldownPanel/KnowledgePreviewPane.vue';
  import ModelsPane from '../components/DrilldownPanel/ModelsPane.vue';
  import EntitiesPane from '../components/DrilldownPanel/EntitiesPane.vue';
  import ModalDocument from '../components/Modals/ModalDocument.vue';

  const DRILLDOWN_TABS: TabInterface[] = [
    { name: 'Preview', icon: '', id: 'preview' },
    { name: 'Models', icon: '', id: 'models' },
    { name: 'Entities', icon: '', id: 'entities' },
  ];

  const components = {
    SearchBar,
    Settings,
    SettingsBar,
    Counters,
    CardContainer,
    DrilldownPanel,
    KnowledgePreviewPane,
    ModelsPane,
    EntitiesPane,
    ModalDocument,
    Loader,
  };

  @Component({ components })
  export default class DocsCards extends Vue {
    dataLoading = false;
    data: CosmosSearchInterface | Record<any, never> = {};
    filterHash: string = '';

    drilldownTabs: TabInterface[] = DRILLDOWN_TABS;
    isOpenDrilldown: boolean = false;
    drilldownActiveTabId: string = '';
    drilldownData: CosmosSearchObjectsInterface | Record<any, never> = {};

    showModalDocuments: boolean = false;

    @Getter getFilters;
    @Getter getModelsList;

    @Watch('getFilters') onGetFiltersChanged (): void {
      this.fetchCosmos();
    }

    mounted (): void {
      this.fetchCosmos();
    }

    async fetchCosmos (): Promise<void> {
      const facetSelection = this.facetSelection;
      const filterHashNew = JSON.stringify(facetSelection);

      if (filterHashNew !== this.filterHash || !_.isEmpty(facetSelection.cosmosQuery)) {
        this.filterHash = filterHashNew;
        try {
          this.dataLoading = true;
          const response = await cosmosSearch(filterToParamObj(this.facetSelection));
          this.data = response;
        } catch (e) {
          throw Error(e);
        }
        this.dataLoading = false;
      }
    }

    // TO-DO: Refactor with the same function in FacetsPane.vue
    public get facetTerms (): any {
      return Object.keys(QUERY_FIELDS_MAP).map(queryFieldKey => QUERY_FIELDS_MAP[queryFieldKey].field);
    }

    // TO-DO: Refactor with the same function in FacetsPane.vue
    public get facetSelection (): FacetTermsSelectionMap {
      const selectionMap = {};
      this.facetTerms.forEach(facet => {
        let selection = {};
        const facetClause = filtersUtil.findPositiveFacetClause(this.getFilters, facet);
        if (!_.isEmpty(facetClause)) {
          switch (facetClause.field) {
            case QUERY_FIELDS_MAP.MODEL_TYPE.field: {
              facetClause.values.forEach(value => {
                selection[value] = true;
              });
              break;
            }
            default: {
              selection = facetClause.values;
            }
          }
        }
        selectionMap[facet] = selection;
      });
      return selectionMap;
    }

    get searchPills (): (KeyValuePill | TextPill)[] {
      return [
        new TextPill(QUERY_FIELDS_MAP.COSMOS_QUERY),
        new KeyValuePill(
          QUERY_FIELDS_MAP.COSMOS_TYPE,
          modelTypeUtil.COSMOS_TYPE_OPTIONS,
          'Select type..',
          { single: true, multiValue: false },
        ),
        new KeyValuePill(
          QUERY_FIELDS_MAP.COSMOS_INCLUSIVE,
          modelTypeUtil.COSMOS_INCLUSIVE_OPTIONS,
          'Select option..',
          { single: true, multiValue: false },
        ),
        new TextPill(
          QUERY_FIELDS_MAP.COSMOS_BASE_CONFIDENCE,
          { multiValue: false },
        ),
        new TextPill(
          QUERY_FIELDS_MAP.COSMOS_POSTPROCESSING_CONFIDENCE,
          { multiValue: false },
        ),
      ];
    }

    get countersData (): Array<string> {
      const data = this.data as CosmosSearchInterface;
      if (data && data.total !== undefined && data.page !== undefined) {
        return [`${data.total} Documents`, `Page ${data.page + 1}`];
      }
    }

    get docsCards (): CardInterface[] {
      const data = this.data as CosmosSearchInterface;
      return data.objects && data.objects.map((item, index) => ({
        id: index,
        title: item.bibjson.title,
        subtitle: `${item.bibjson.year} ?? 'Unknown Year'} - ${getAuthorList(item)}`,
        type: item.bibjson.type,
        previewImageSrc: item.children[0].bytes,
        raw: item,
      }));
    }

    onDrilldownTabClick (tabId: string): void {
      this.drilldownActiveTabId = tabId;
    }

    onCardClick (card: CosmosSearchObjectsInterface): void {
      this.isOpenDrilldown = true;
      this.drilldownActiveTabId = 'preview';

      this.drilldownData = card;
    }

    onCloseDrilldownPanel (): void {
      this.isOpenDrilldown = false;
    }
  }
</script>

<style lang="scss" scoped>
</style>
