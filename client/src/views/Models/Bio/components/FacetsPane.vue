<template>
  <div class="facets-pane-container">
    <facet-histogram
      label="Beliefs"
      :data="beliefs"
    />
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import FacetHistogram from '@/components/FacetHistogram.vue';
  import { FacetBarsBaseData } from '@uncharted.software/facets-core/dist/types/facet-bars-base/FacetBarsBase';

  const components = {
    FacetHistogram,
  };

  @Component({ components })
  export default class FacetsPane extends Vue {
    get beliefs (): FacetBarsBaseData {
      return [] as FacetBarsBaseData;
    }
  }
</script>
