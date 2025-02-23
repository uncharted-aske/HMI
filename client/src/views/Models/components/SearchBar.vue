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
  import { initializeLex, setPills } from '@/utils/LexUtil';
  import * as filtersUtil from '@/utils/FiltersUtil';
  import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
  import PathQueryPill from '@/search/pills/PathQueryPill';

  @Component
  export default class SearchBar extends Vue {
    private lex: Lex = null;
    private pills: any = [];

    @Getter getFilters;
    @Action setFilters;

    @Watch('getFilters') onGetFiltersChanged (): void {
      setPills({ lex: this.lex, pills: this.pills, filters: this.getFilters });
    }

    mounted (): void {
      /* add pills here */
      this.pills = [new PathQueryPill(QUERY_FIELDS_MAP.EPI_PATH)];

      this.lex = initializeLex({
        pills: this.pills,
        onChange: (newFilters) => {
          if (filtersUtil.isEqual(this.getFilters, newFilters) === false) {
            this.setFilters(newFilters);
          }
        },
        placeholder: 'Search model components, paths...',
        fieldName: 'Choose a field to search',
      });

      // Render our search bar into our desired element
      this.lex.render(this.$refs.lexContainer);
      setPills({ lex: this.lex, pills: this.pills, filters: this.getFilters });
    }
  }
</script>

<style lang="scss">
// Note: Scoped imports not attached to rendered elements
@import "~@uncharted.software/lex/dist/lex.scss";
</style>
