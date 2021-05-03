<template>
  <div class="facets-pane-container">
    <facet-histogram label="Beliefs" :data="beliefs" />
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter } from 'vuex-class';
  import { Watch } from 'vue-property-decorator';
  import FacetHistogram from '@/components/FacetHistogram.vue';
  import { FacetBarsBaseData } from '@uncharted.software/facets-core/dist/types/facet-bars-base/FacetBarsBase';
  import { Filtre, FILTRES_FIELDS } from '@/types/typesFiltres';
  import * as FiltresUtil from '@/utils/FiltresUtil';

  const components = {
    FacetHistogram,
  };

  @Component({ components })
  export default class FacetsPane extends Vue {
    beliefs: FacetBarsBaseData = [];

    @Getter getFiltres;

    @Watch('getFiltres') onGetFiltresChanged (): void {
      this.updateBeliefFacets();
    }

    mounted (): void {
      this.updateBeliefFacets();
    }

    updateBeliefFacets (): void {
      const beliefsFiltre = this.getFiltres.get(FILTRES_FIELDS.BELIEF_SCORE) as Filtre;
      if (beliefsFiltre) {
        const beliefsAggregate = beliefsFiltre.aggregates;
        const beliefsFacetBars = FiltresUtil.aggregatesToFacetsBars(beliefsAggregate) as FacetBarsBaseData;
        this.beliefs = beliefsFacetBars;
      }
    }
  }
</script>
