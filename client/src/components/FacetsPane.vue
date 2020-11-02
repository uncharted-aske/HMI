<template>
  <div class="facets-pane-container">
    <facets
      :field="codeTable.MODEL_TYPE.field"
      :fdata="facetData"
      :fselection="facetSelection"
      :fsubselection="facetSubselection"
    />
  </div>
</template>

<script lang="ts">

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter } from 'vuex-class';
  import _ from 'lodash';
  import Facets from '@/components/Facets.vue';
  import { FacetTermsData, FacetTermsSelection, FacetTermsSubselection } from '@uncharted.software/facets-core/dist/types/facet-terms/FacetTerms';
  import facetsService from '../services/FacetsService';
  import filtersUtil from '../utils/FiltersUtil';
  import { CODE_TABLE } from '../utils/CodeUtil';

  const components = {
    Facets,
  };

  @Component({ components })
  export default class FacetsPane extends Vue {
    @Getter getModelsList;
    @Getter getFilters;

    public get codeTable (): any {
      return CODE_TABLE;
    }

    public get facetSelection (): FacetTermsSelection {
      const selection: FacetTermsSelection = {};
      const facetClause = filtersUtil.findPositiveFacetClause(this.getFilters, CODE_TABLE.MODEL_TYPE.field);
      if (!_.isEmpty(facetClause)) {
        facetClause.values.forEach(value => {
          selection[value] = true;
        });
      }
      return selection;
    }

    public get facetSubselection (): FacetTermsSubselection {
      const subselection = facetsService.fetchFacets(this.getModelsList, this.getFilters)[CODE_TABLE.MODEL_TYPE.field].map(group => group.ratio);
      return subselection;
    }

    public get facetData (): FacetTermsData {
      const values = facetsService.fetchFacets(this.getModelsList, [])[CODE_TABLE.MODEL_TYPE.field];
      return {
        values,
        label: 'Model Types',
      };
    }
  }
</script>

<style lang="scss" scoped>
</style>
