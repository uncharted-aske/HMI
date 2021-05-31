<template>
  <div class="search-bar-container">
    <div ref="lexContainer"></div>
  </div>
</template>

<script lang="ts">

  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Getter, Action } from 'vuex-class';
  import { Watch } from 'vue-property-decorator';

  import { Lex } from '@uncharted.software/lex/dist/lex';
  import KeyValuePill from '@/search/pills/KeyValuePill';
  import RangeKeyValuePill from '@/search/pills/RangeKeyValuePill';
  import TextPill from '@/search/pills/TextPill';

  import * as filtersUtil from '@/utils/FiltersUtil';
  import * as FiltresUtil from '@/utils/FiltresUtil';
  import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
  import { BOOLEAN_OPTIONS, BIO_EDGE_TYPE_OPTIONS } from '@/utils/ModelTypeUtil';
  import { initializeLex, setPills } from '@/utils/LexUtil';

  import { Filtre, FILTRES, FILTRES_FIELDS } from '@/types/typesFiltres';

  @Component
  export default class SearchBar extends Vue {
    private lex: Lex = null;
    private pills: any = [];

    @Getter getFiltres;
    @Getter getFilters;
    @Action setFilters;

    @Watch('getFiltres') onGetFiltresChanged (): void {
      this.initialize();
    }

    @Watch('getFilters') onGetFiltersChanged (): void {
      setPills({ lex: this.lex, pills: this.pills, filters: this.getFilters });
    }

    get beliefLabels (): string[] {
      const beliefName = FILTRES[FILTRES_FIELDS.BELIEF_SCORE].name;
      const beliefsFiltre = this.getFiltres.find(f => f.field === beliefName) as Filtre;

      if (beliefsFiltre) {
        const beliefsAggregate = beliefsFiltre.aggregates;
        return (FiltresUtil.aggregatesToFacetsBars(beliefsAggregate) as any[]).map(val => val.label);
      }

      return [];
    }

    mounted (): void {
      this.initialize();
    }

    initialize (): void {
      /* add pills here */
      this.pills = [
        new TextPill(QUERY_FIELDS_MAP.BIO_NODE_NAME),
        new KeyValuePill(
          QUERY_FIELDS_MAP.BIO_NODE_GROUNDED,
          BOOLEAN_OPTIONS,
          '',
          { single: true, multiValue: false },
        ),
        new KeyValuePill(
          QUERY_FIELDS_MAP.BIO_NODE_GROUNDED_ONTO,
          BOOLEAN_OPTIONS,
          '',
          { single: true, multiValue: false },
        ),
        new TextPill(QUERY_FIELDS_MAP.BIO_NODE_IN_DEGREE),
        new TextPill(QUERY_FIELDS_MAP.BIO_NODE_OUT_DEGREE),
        new KeyValuePill(
          QUERY_FIELDS_MAP.BIO_EDGE_TESTED,
          BOOLEAN_OPTIONS,
          '',
          { single: true, multiValue: false },
        ),
        new TextPill(QUERY_FIELDS_MAP.BIO_EDGE_DOI),
        new KeyValuePill(
          QUERY_FIELDS_MAP.BIO_EDGE_TYPE,
          BIO_EDGE_TYPE_OPTIONS,
          '',
          { single: true, multiValue: true },
        ),
        new RangeKeyValuePill(
          QUERY_FIELDS_MAP.BIO_EDGE_BELIEF,
          this.beliefLabels,
          '',
        ),
      ];

      this.lex = initializeLex({
        pills: this.pills,
        placeholder: 'Search model...',
        fieldName: 'Choose a field to search',
        onChange: async (newFilters) => {
          if (!filtersUtil.isEqual(this.getFilters, newFilters)) {
            this.setFilters(newFilters);
          }
        },
      });

      // Render our search bar into our desired element
      this.lex.render(this.$refs.lexContainer);
      setPills({ lex: this.lex, pills: this.pills, filters: this.getFilters });
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/overrides";
</style>

<style lang="scss">
// Note: Scoped imports not attached to rendered elements
@import "~@uncharted.software/lex/dist/lex.scss";
</style>
