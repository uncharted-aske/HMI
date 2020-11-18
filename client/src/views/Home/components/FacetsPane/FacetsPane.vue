<template>
  <div class="facets-pane-container">
    <facets
      :field="queryFieldsMap.MODEL_TYPE.field"
      :data="facetData[queryFieldsMap.MODEL_TYPE.field]"
      :selection="facetSelection[queryFieldsMap.MODEL_TYPE.field]"
      :subselection="facetSubselection[queryFieldsMap.MODEL_TYPE.field]"
    />
  </div>
</template>

<script lang="ts">

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter } from 'vuex-class';
  import _ from 'lodash';
  import Facets from '@/components/Facets.vue';
  import * as facetsService from '@/services/FacetsService';
  import * as filtersUtil from '@/utils/FiltersUtil';
  import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
  import { FacetTermsDataMap, FacetTermsSelectionMap, FacetTermsSubselectionMap } from '@/types/types';

  const components = {
    Facets,
  };

  @Component({ components })
  export default class FacetsPane extends Vue {
    @Getter getModelsList;
    @Getter getFilters;

    public get queryFieldsMap (): typeof QUERY_FIELDS_MAP {
      return QUERY_FIELDS_MAP;
    }

    public get facets (): any {
      return Object.keys(QUERY_FIELDS_MAP).map(queryFieldKey => QUERY_FIELDS_MAP[queryFieldKey].field);
    }

    public get facetSelection (): FacetTermsSelectionMap {
      const selectionMap = {};
      this.facets.forEach(facet => {
        const selection = {};
        const facetClause = filtersUtil.findPositiveFacetClause(this.getFilters, facet);
        if (!_.isEmpty(facetClause)) {
          facetClause.values.forEach(value => {
            selection[value] = true;
          });
        }
        selectionMap[facet] = selection;
      });
      return selectionMap;
    }

    public get facetSubselection (): FacetTermsSubselectionMap {
      const subselectionMap = {};
      const facetAggs = facetsService.fetchFacets(this.getModelsList, this.getFilters);
      this.facets.forEach(facet => {
        const subselection = facetAggs[facet].map(group => group.ratio);
        subselectionMap[facet] = subselection;
      });
      return subselectionMap;
    }

    public get facetData (): FacetTermsDataMap {
      const dataMap = {};
      const facetAggs = facetsService.fetchFacets(this.getModelsList, []);
      this.facets.forEach(facet => {
        const values = facetAggs[facet];
        const data = {
          values,
          label: 'Model Types',
        };
        dataMap[facet] = data;
      });
      return dataMap;
    }
  }
</script>

<style lang="scss" scoped>
</style>
