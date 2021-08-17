<template>
  <div class="view-container">
    <main>
      <div class="search-row">
        <search-bar :pills="searchPills" :placeholder="`Search for documents including a specific keyword (e.g. IL-6)...`" />
      </div>
      <settings-bar>
        <counters slot="left" :data="countersData"/>
        <settings slot="right" />
      </settings-bar>

      <loader v-if="!docsCards" :loading="true" />
      <card-container
        v-else
        :header="`Knowledge`"
        :cards="docsCards"
        @click-card="onClickCard"
      />
    </main>

    <drilldown-panel
      :active-tab-id="drilldownActiveTabId"
      :is-open="isOpenDrilldown"
      :tabs="drilldownTabs"
      @close-pane="onCloseDrilldownPanel"
      @tab-click="onDrilldownTabClick"
    >
      <knowledge-preview-pane
        v-if="drilldownActiveTabId === 'preview'"
        slot="content"
        :data="drilldownData"
        @open-modal="showModalDocuments = true"
      />
      <models-pane
        v-if="drilldownActiveTabId === 'models'"
        slot="content"
        :data="drilldownData"
      />
      <entities-pane
        v-if="drilldownActiveTabId === 'entities'"
        slot="content"
        :data="drilldownData"
      />
    </drilldown-panel>

    <modal-document
      v-if="showModalDocuments"
      :data="drilldownData.raw"
      @close="showModalDocuments = false"
    />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Watch } from 'vue-property-decorator';
  import { Getter } from 'vuex-class';
  import _ from 'lodash';

  import { CosmosSearchInterface } from '@/types/typesCosmos';
  import { FacetTermsSelectionMap } from '@/types/typesFacets';
  import { CardInterface, Counter, TabInterface } from '@/types/types';

  import TextPill from '@/search/pills/TextPill';
  import KeyValuePill from '@/search/pills/KeyValuePill';

  import * as filtersUtil from '@/utils/FiltersUtil';
  import * as modelTypeUtil from '@/utils/ModelTypeUtil';
  import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
  import { filterToParamObj, getAuthorList } from '@/utils/CosmosDataUtil';

  import { cosmosSearch } from '@/services/CosmosFetchService';

  import SearchBar from '@/components/SearchBar.vue';
  import Loader from '@/components/widgets/Loader.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Settings from '../components/Settings.vue';
  import Counters from '@/components/Counters.vue';
  import CardContainer from '@/components/Cards/CardContainer.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import KnowledgePreviewPane from '../components/DrilldownPanel/KnowledgePreviewPane.vue';
  import ModelsPane from '../components/DrilldownPanel/ModelsPane.vue';
  import EntitiesPane from '../components/DrilldownPanel/EntitiesPane.vue';
  import ModalDocument from '@/components/Modals/ModalDocument.vue';

  const DRILLDOWN_TABS: TabInterface[] = [
    { name: 'Preview', icon: '', id: 'preview' },
    { name: 'Models', icon: '', id: 'models' },
    { name: 'Entities', icon: '', id: 'entities' },
  ];

  const components = {
    CardContainer,
    Counters,
    DrilldownPanel,
    EntitiesPane,
    KnowledgePreviewPane,
    Loader,
    ModalDocument,
    ModelsPane,
    SearchBar,
    Settings,
    SettingsBar,
  };

  @Component({ components })
  export default class DocsCards extends Vue {
    data: CosmosSearchInterface | Record<any, never> = {};
    filterHash: string = '';

    drilldownTabs: TabInterface[] = DRILLDOWN_TABS;
    isOpenDrilldown: boolean = false;
    drilldownActiveTabId: string = '';
    drilldownData: CardInterface | Record<any, never> = {};
    showModalDocuments: boolean = false;

    @Getter getFilters;

    @Watch('getFilters') onGetFiltersChanged (): void {
      this.fetchCosmos();
    }

    mounted (): void {
      this.fetchCosmos();
    }

    async fetchCosmos (): Promise<void> {
      const filterHashNew = JSON.stringify(this.facetSelection);

      if (filterHashNew !== this.filterHash || !_.isEmpty(this.facetSelection.cosmosQuery)) {
        this.filterHash = filterHashNew;
        try {
          this.data = await cosmosSearch(filterToParamObj(this.facetSelection));
        } catch (e) {
          throw Error(e);
        }
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
        new TextPill(QUERY_FIELDS_MAP.COSMOS_DOI),
        new TextPill(QUERY_FIELDS_MAP.COSMOS_ASKE_ID),
        new KeyValuePill(
          QUERY_FIELDS_MAP.COSMOS_TYPE,
          modelTypeUtil.COSMOS_TYPE_OPTIONS,
          'Select type..',
          { single: true, multiValue: false },
        ),
        new KeyValuePill(
          QUERY_FIELDS_MAP.COSMOS_INCLUSIVE,
          modelTypeUtil.BOOLEAN_OPTIONS,
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

    get countersData (): Array<Counter> {
      const data = this.data as CosmosSearchInterface;
      if (data && data.total !== undefined && data.page !== undefined) {
        return [
          { name: 'Documents', value: data.total },
          { name: 'Page', value: (data.page + 1), inverse: true },
        ];
      }
    }

    get docsCards (): CardInterface[] {
      const data = this.data as CosmosSearchInterface;
      if (!data.objects) return;

      return data.objects.map((item, index) => (
        {
          id: index,
          title: item.bibjson.title,
          subtitle: `${item.bibjson.year} ?? 'Unknown Year'} - ${getAuthorList(item.bibjson)}`,
          type: item.bibjson.type,
          previewImageSrc: item.children[0].bytes,
          raw: item,
          // If the drilldown is open, we highlight the corresponding card.
          highlighted: this.isDrilldownCard(index),
        } as CardInterface
      ));
    }

    onDrilldownTabClick (tabId: string): void {
      this.drilldownActiveTabId = tabId;
    }

    onClickCard (card: CardInterface): void {
      // If the card is the one already selected
      if (this.isDrilldownCard(card.id)) {
        this.closeDrilldown();
      } else {
        this.isOpenDrilldown = true;
        this.drilldownActiveTabId = 'preview';
        this.drilldownData = card;
      }
    }

    onCloseDrilldownPanel (): void {
      this.closeDrilldown();
    }

    isDrilldownCard (cardId: number): boolean {
      return this.drilldownData?.id === cardId;
    }

    closeDrilldown (): void {
      this.isOpenDrilldown = false;
      this.drilldownData = null;
      this.drilldownActiveTabId = null;
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
