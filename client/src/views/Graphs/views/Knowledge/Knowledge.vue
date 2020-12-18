<template>
  <div class="view-container">
    <left-side-panel @close-pane="onClosePane">
      <div slot="content">
        <facets-pane />
      </div>
    </left-side-panel>

    <div class="content">
      <div class="search-row">
        <search-bar :pills="searchPills" />
      </div>
      <settings-bar>
        <div slot="counters">
          <counters :data="countersData"/>
        </div>
        <div slot="settings">
          <settings />
        </div>
      </settings-bar>
      <card-container
          :header="`Knowledge`"
          :cards="modelsCards"
          @open-card="onOpenCard"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import { Watch } from 'vue-property-decorator';
  import Vue from 'vue';
  import { Getter, Mutation } from 'vuex-class';
  import _ from 'lodash';

  import { CardInterface } from '@/views/Home/types/types';

  import SearchBar from '@/components/SearchBar.vue';
  import TextPill from '@/search/pills/TextPill';
  import KeyValuePill from '@/search/pills/KeyValuePill';
  import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
  import * as modelTypeUtil from '@/utils/ModelTypeUtil';

  import * as filtersUtil from '@/utils/FiltersUtil';
  import { filterToParamObj, wiscFetch } from '@/utils/WiscFetchUtil';

  import ActionColumn from '@/components/ActionColumn.vue';
  import ActionColumnNavBar from '@/components/ActionColumnNavBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Settings from './Settings/Settings.vue';
  import Counters from '@/views/Graphs/components/Counters/Counters.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import FacetsPane from '@/views/Home/components/FacetsPane/FacetsPane.vue';
  import CardContainer from '@/components/Cards/CardContainer.vue';

  import { FacetTermsSelectionMap } from '@/types/types';

  const ACTIONS = [
    { name: 'Facets', icon: 'filter', paneId: 'facets' },
  ];

  const components = {
    ActionColumn,
    ActionColumnNavBar,
    SearchBar,
    Settings,
    SettingsBar,
    Counters,
    LeftSidePanel,
    FacetsPane,
    CardContainer,
  };

  @Component({ components })
  export default class Knowledge extends Vue {
    activePane = '';
    actions: any = ACTIONS;
    dataLoaded = false;
    data: any = {};
    filterHash: string = '';

    @Getter getFilters;
    @Getter getModelsList;
    @Mutation setSelectedModel;

    @Watch('getFilters') onGetFiltersChanged (): void {
      this.fetchWisc();
    }

    mounted (): void {
      this.fetchWisc();
    }

    async fetchWisc (): Promise<void> {
      const facetSelection = this.facetSelection;
      const filterHashNew = JSON.stringify(facetSelection);

      if (filterHashNew !== this.filterHash || !_.isEmpty(facetSelection.cosmosQuery)) {
        this.filterHash = filterHashNew;
        try {
          const response = await wiscFetch(filterToParamObj(this.facetSelection));
          this.data = response;
          this.dataLoaded = true;
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

    get searchPills (): any {
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
      const { data } = this;
      if (data && data.total !== undefined && data.page !== undefined) {
        return [`${data.total} Documents`, `Page ${data.page + 1}`];
      }
    }

    get currentAction (): string {
      return this.activePane && this.actions.find(a => a.paneId === this.activePane).name;
    }

    get modelsCards (): CardInterface[] {
      return this.data.objects && this.data.objects.map((item, index) => ({
        id: index,
        title: item.bibjson.title,
        subtitle: `${item.bibjson.year ?? 'Unknown Year'} - ${item.bibjson.author.length === 0
          ? 'Unknown Author'
          : item.bibjson.author.reduce((acc, author, index) => {
            acc += author.name;
            if (index !== item.bibjson.author.length - 1) {
              acc += ', ';
            }
            return acc;
          }, '')}
        `,
        type: item.bibjson.type,
        previewImageSrc: item.children[0].bytes,
      }));
    }

    onOpenCard (card: CardInterface): void {
      const view = card.type === 'computational' ? 'epiView' : 'bioView';
      this.setSelectedModel(card.id);
      this.$router.push({ name: view });
    }

    onSetActivePane (actionName: string): void {
      let activePane = '';
      if (actionName !== '') {
        activePane = this.actions.find(a => a.name === actionName).paneId;
      }
      this.activePane = activePane;
    }

    onClosePane ():void {
      this.activePane = '';
    }
  }
</script>

<style lang="scss" scoped>
</style>
