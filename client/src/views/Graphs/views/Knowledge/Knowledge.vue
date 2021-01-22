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
          @open-card="onOpenPanel"
      />
      <div class="loader-container" v-if="dataLoading">
        <div class="loader">Loading...</div>
      </div>
    </div>
    <knowledge-drilldown :card="openDrilldown" @close-card="onCloseDrilldown"/>
    <drilldown-panel @close-pane="onClosePanel" :is-open="isOpenPanel">
      <knowledge-panel slot="content" @close-card="onOpenDrilldown" :card="openPanel"/>
    </drilldown-panel>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import { Watch } from 'vue-property-decorator';
  import Vue from 'vue';
  import { Getter, Mutation } from 'vuex-class';
  import _ from 'lodash';

  import { CosmosSearchInterface, CosmosSearchObjectsInterface } from '@/types/typesCosmos';
  import { CardInterface } from '@/components/Cards/types';

  import SearchBar from '@/components/SearchBar.vue';
  import TextPill from '@/search/pills/TextPill';
  import KeyValuePill from '@/search/pills/KeyValuePill';
  import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
  import * as modelTypeUtil from '@/utils/ModelTypeUtil';

  import * as filtersUtil from '@/utils/FiltersUtil';
  import { filterToParamObj, cosmosFetchMem } from '@/utils/CosmosFetchUtil';
  import { getAuthorList } from '@/utils/CosmosDataUtil';

  import ActionColumn from '@/components/ActionColumn.vue';
  import ActionColumnNavBar from '@/components/ActionColumnNavBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Settings from './Settings/Settings.vue';
  import Counters from '@/views/Graphs/components/Counters/Counters.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import FacetsPane from '@/views/Home/components/FacetsPane/FacetsPane.vue';
  import CardContainer from '@/components/Cards/CardContainer.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import KnowledgeDrilldown from './components/KnowledgeDrilldown.vue';
  import knowledgePanel from './components/KnowledgePanel.vue';

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
    KnowledgeDrilldown,
    DrilldownPanel,
    knowledgePanel,
  };

  @Component({ components })
  export default class Knowledge extends Vue {
    activePane = '';
    actions: any = ACTIONS;
    dataLoading = false;
    data: CosmosSearchInterface | Record<any, never> = {};
    filterHash: string = '';
    openPanel: CosmosSearchObjectsInterface | Record<any, never> = {};
    openDrilldown: CosmosSearchObjectsInterface | Record<any, never> = {};

    @Getter getFilters;
    @Getter getModelsList;
    @Mutation setSelectedModel;

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
          const response = await cosmosFetchMem(filterToParamObj(this.facetSelection));
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

    get currentAction (): string {
      return this.activePane && this.actions.find(a => a.paneId === this.activePane).name;
    }

    get modelsCards (): CardInterface[] {
      const data = this.data as CosmosSearchInterface;
      return data.objects && data.objects.map((item, index) => ({
        id: index,
        title: item.bibjson.title,
        subtitle: `${item.bibjson.year ?? 'Unknown Year'} - ${getAuthorList(item)}
        `,
        type: item.bibjson.type,
        previewImageSrc: item.children[0].bytes,
        raw: item,
      }));
    }

    get isOpenPanel (): boolean {
      return !_.isEmpty(this.openPanel);
    }

    onOpenPanel (card: CosmosSearchObjectsInterface): void {
      this.openPanel = card;
      this.openDrilldown = {};
    }

    onClosePanel (): void {
      this.openPanel = {};
    }

    onOpenDrilldown (card: CosmosSearchObjectsInterface): void {
      this.openDrilldown = card || this.openPanel;
      this.openPanel = {};
    }

    onCloseDrilldown (): void {
      this.openDrilldown = {};
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
@import '@/styles/variables';

.loader-container {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  pointer-events: none;
}

// https://github.com/lukehaas/css-loaders
.loader,
.loader:before,
.loader:after {
  background: #263238;
  -webkit-animation: load1 1s infinite ease-in-out;
  animation: load1 1s infinite ease-in-out;
  width: 1em;
  height: 4em;
}
.loader {
  color: #263238;
  text-indent: -9999em;
  margin: 88px auto;
  position: relative;
  font-size: 11px;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}
.loader:before,
.loader:after {
  position: absolute;
  top: 0;
  content: '';
}
.loader:before {
  left: -1.5em;
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}
.loader:after {
  left: 1.5em;
}
@-webkit-keyframes load1 {
  0%,
  80%,
  100% {
    box-shadow: 0 0;
    height: 4em;
  }
  40% {
    box-shadow: 0 -2em;
    height: 5em;
  }
}
@keyframes load1 {
  0%,
  80%,
  100% {
    box-shadow: 0 0;
    height: 4em;
  }
  40% {
    box-shadow: 0 -2em;
    height: 5em;
  }
}
</style>
