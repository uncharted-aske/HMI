<template>
  <div class="facet-bars-container">
    <facet-bars
      ref="facetBars"
      :data.prop="facetsData"
      :selection.prop="selection"
      :disabled.prop="disabled"
      @facet-element-updated="handleFacetUpdated"
    />
  </div>
</template>

<script lang="ts">

  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import '@uncharted.software/facets-core';
  import { FacetBars, FacetBarsData } from '@uncharted.software/facets-core/dist/types/facet-bars/FacetBars';
  import { FacetBarsBaseData } from '@uncharted.software/facets-core/dist/types/facet-bars-base/FacetBarsBase';

  @Component
  export default class HMIFacetBars extends Vue {
    @Prop({ required: false, type: String }) private label: string;
    @Prop({ required: true, type: Array }) private data: FacetBarsBaseData;
    @Prop({ required: false, type: Array }) private selection: [number, number];
    @Prop({ required: false, type: Boolean }) private disabled: boolean;

    get facetsData () : FacetBarsData {
      return {
        label: this.label || '',
        values: this.data,
      };
    }

    private handleFacetUpdated (event: CustomEvent): void {
      const facet: FacetBars = this.$refs.facetBars as FacetBars;
      this.$emit('handleUpdate', event, facet);
    }
  }
</script>
