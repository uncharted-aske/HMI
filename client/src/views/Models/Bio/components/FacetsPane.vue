<template>
  <div class="facets-pane-container">
    <facet-histogram
      :data="beliefsData"
      :field="beliefName"
      :label="beliefsTitle"
      :selection="beliefSelection"
    />
  </div>
</template>

<script lang="ts">
  import { invert } from 'lodash';
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter } from 'vuex-class';
  import { Watch } from 'vue-property-decorator';
  import FacetHistogram from '@/components/FacetHistogram.vue';
  import { FacetBarsBaseData } from '@uncharted.software/facets-core/dist/types/facet-bars-base/FacetBarsBase';
  import { Filtre, FILTRES, FILTRES_FIELDS } from '@/types/typesFiltres';
  import { Filter } from '@/types/typesLex';
  import * as FiltresUtil from '@/utils/FiltresUtil';

  const components = {
    FacetHistogram,
  };

  const LOADING_FACETS_DATA: FacetBarsBaseData = new Array(10).fill(null);

  @Component({ components })
  export default class FacetsPane extends Vue {
    beliefsData = LOADING_FACETS_DATA;
    beliefName: string = FILTRES[FILTRES_FIELDS.BELIEF_SCORE].name;
    beliefsTitle: string = FILTRES[FILTRES_FIELDS.BELIEF_SCORE].displayName;

    @Getter getFiltres;
    @Getter getFilters;

    @Watch('getFiltres') onGetFiltresChanged (): void {
      this.updateBeliefFacets();
    }

    get beliefSelection (): number[] {
      const filters: Filter[] = this.getFilters?.clauses;
      const beliefsFiltre = this.getFiltres.find(f => f.field === this.beliefName) as Filtre;

      if (filters && beliefsFiltre) {
        const beliefFilter: Filter = filters.find(filter => filter.field === this.beliefName);

        const beliefsAggregate = beliefsFiltre.aggregates;
        const keyMapInverted = invert((FiltresUtil.aggregatesToFacetsBars(beliefsAggregate) as any[]).map(val => val.label));

        return (beliefFilter?.values?.[0] as unknown as number[]).map(v => Number(keyMapInverted[v]));
      }
    }

    mounted (): void {
      this.updateBeliefFacets();
    }

    updateBeliefFacets (): void {
      const beliefsFiltre = this.getFiltres.find(f => f.field === this.beliefName) as Filtre;
      if (beliefsFiltre) {
        const beliefsAggregate = beliefsFiltre.aggregates;
        const beliefsFacetBars = FiltresUtil.aggregatesToFacetsBars(beliefsAggregate);
        this.beliefsData = beliefsFacetBars;
      }
    }
  }
</script>
