<template>
  <facetBars
    :label="label"
    :data="getData"
    :selection="selection"
    :disabled="disabled"
    @handleUpdate="handleFacetUpdated"
  />
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Action } from 'vuex-class';
  import { Prop } from 'vue-property-decorator';
  import _ from 'lodash';
  import '@uncharted.software/facets-core';
  import { FacetBars as FacetsFacetBars } from '@uncharted.software/facets-core/dist/types/facet-bars/FacetBars';
  import { FacetBarsBaseData } from '@uncharted.software/facets-core/dist/types/facet-bars-base/FacetBarsBase';

  import FacetBars from '@/components/FacetBars.vue';

  const components = {
    FacetBars,
  };

  @Component({ components })
  export default class FacetHistogram extends Vue {
    @Prop({ required: true, type: String }) private label: string;
    @Prop({ required: false, type: String }) private field: string;
    @Prop({ required: true, type: Array }) private data: FacetBarsBaseData;
    @Prop({ required: false, type: Array }) private selection: number[];
    @Prop({ required: false, type: Boolean }) private disabled: boolean;

    @Action addTerm;
    @Action removeTerm;

    public get getData (): FacetBarsBaseData {
      const data = this.data as any[];
      return data.slice(0, data.length - 1);
    }

    public handleFacetUpdated (facetEvent: CustomEvent, facet: FacetsFacetBars): void {
      const changedProperties: Map<string, any> = facetEvent.detail.changedProperties;
      if (changedProperties.has('selection')) {
        const newSelection: number[] = facet.selection;

        const field = this.field || 'histogram';
        this.removeTerm({ field });

        if (_.isArray(newSelection) && newSelection.length === 2) {
          const dataMap = (this.data as any[]).map(val => val.label);
          this.addTerm({ field, term: newSelection.map(bin => dataMap[bin]) });
        }
      }
    }
  }
</script>
