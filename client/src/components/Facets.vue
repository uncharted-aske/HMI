<template>
  <div class="facet-container">
    <facet-terms
      ref="facet"
      :data.prop="data"
      :selection.prop="selection"
      :subselection.prop="subselection"
      @facet-element-updated="handleFacetUpdated" />
  </div>
</template>

<script lang="ts">

  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Action } from 'vuex-class';
  import { Prop } from 'vue-property-decorator';
  import _ from 'lodash';
  import '@uncharted.software/facets-core';
  import { FacetTerms, FacetTermsData, FacetTermsSelection, FacetTermsSubselection } from '@uncharted.software/facets-core/dist/types/facet-terms/FacetTerms';
  import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';

  @Component
  export default class Facets extends Vue {
    @Prop({ required: true, type: Object }) private data: FacetTermsData;
    @Prop({ required: true, type: Object }) private selection: FacetTermsSelection;
    @Prop({ required: true, type: Array }) private subselection: FacetTermsSubselection;
    @Prop({ required: true, type: String }) private field: string;

    @Action addTerm;
    @Action removeTerm;

    private handleFacetUpdated (event: CustomEvent): void {
      const changedProperties: Map<string, any> = event.detail.changedProperties;
      if (changedProperties.has('selection')) {
        const facet: FacetTerms = this.$refs.facet as FacetTerms;
        const oldSelection: FacetTermsSelection = event.detail.changedProperties.get('selection') || {};
        const newSelection: FacetTermsSelection = facet.selection || {};

        // Add/remove terms that have been changed by selection
        // Note: Must convert added/removed terms to Number type to be consistent with the type Lex search uses to set filters
        const added = Object.keys(newSelection).filter(x => !Object.keys(oldSelection).includes(x)).map(x => +x);
        const removed = Object.keys(oldSelection).filter(x => !Object.keys(newSelection).includes(x)).map(x => +x);
        if (!_.isEmpty(added)) {
          this.addTerm({ field: QUERY_FIELDS_MAP.MODEL_TYPE.field, term: added[0] });
        } else if (!_.isEmpty(removed)) {
          this.removeTerm({ field: QUERY_FIELDS_MAP.MODEL_TYPE.field, term: removed[0] });
        }
      }
    }
  }
</script>
