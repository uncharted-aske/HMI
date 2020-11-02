<template>
  <div class="facet-container">
    <facet-terms
      ref="facet"
      :data.prop="fdata"
      :selection.prop="fselection"
      :subselection.prop="fsubselection"
      @facet-element-updated="handleFacetUpdated" />
  </div>
</template>

<script lang="ts">

  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Action } from 'vuex-class';
  import { Prop } from 'vue-property-decorator';
  import _ from 'lodash';
  // eslint-disable-next-line import/no-duplicates
  import '@uncharted.software/facets-core';
  // eslint-disable-next-line import/no-duplicates
  import { FacetTerms } from '@uncharted.software/facets-core';
  import { FacetTermsData, FacetTermsSelection, FacetTermsSubselection } from '@uncharted.software/facets-core/dist/types/facet-terms/FacetTerms';
  import { CODE_TABLE } from '../utils/CodeUtil';
  import { MODEL_TYPE_INDEX } from '../utils/ModelTypeUtil';

  @Component
  export default class Facets extends Vue {
    @Prop(Object) private fdata: FacetTermsData;
    @Prop(Object) private fselection: FacetTermsSelection;
    @Prop(Array) private fsubselection: FacetTermsSubselection;
    @Prop(String) private field: string; // TODO: What should be passed to Prop(??)

    @Action addTerm;
    @Action removeTerm;

    private handleFacetUpdated (event: CustomEvent): void {
      const changedProperties: Map<string, any> = event.detail.changedProperties;
      if (changedProperties.has('selection')) {
        const facet: FacetTerms = this.$refs.facet as FacetTerms;
        const oldSelection: FacetTermsSelection = event.detail.changedProperties.get('selection') || [];
        const newSelection = facet.selection || [];
        const added = Object.keys(newSelection).filter(x => !Object.keys(oldSelection).includes(x));
        const removed = Object.keys(oldSelection).filter(x => !Object.keys(newSelection).includes(x));
        if (!_.isEmpty(added)) {
          this.addTerm({ field: CODE_TABLE.MODEL_TYPE.field, term: MODEL_TYPE_INDEX[added[0]] });
        } else if (!_.isEmpty(removed)) {
          this.removeTerm({ field: CODE_TABLE.MODEL_TYPE.field, term: MODEL_TYPE_INDEX[removed[0]] });
        }
      }
    }
  }
</script>
