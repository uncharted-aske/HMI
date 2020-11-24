<template>
  <div class="facet-bars-container">
    <facet-bars
      ref="facetBars"
      :data.prop="facetsData"
      :disabled.prop="disabled"
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
  import {histogramDegree} from '@/utils/BinningUtil';

  @Component
  export default class HMIFacetBars extends Vue {
    @Prop({ required: false, type: String }) private label: string;
    @Prop({ required: true, type: Object }) private values: FacetBarsBaseData;
    @Prop({ required: false, type: Boolean }) private disabled: boolean;

    get facetsData () : FacetBarsData {
      return {
        label: this.label || '',
        values: this.values,
      };
    }
  }
</script>
