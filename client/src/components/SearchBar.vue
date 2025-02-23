<template>
  <div class="search-bar-container">
    <div ref="lexContainer" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Getter, Action } from 'vuex-class';
  import { Prop, Watch } from 'vue-property-decorator';
  import { Lex } from '@uncharted.software/lex/dist/lex';
  import { initializeLex, setPills } from '@/utils/LexUtil';
  import KeyValuePill from '@/search/pills/KeyValuePill';
  import RangePill from '@/search/pills/RangePill';
  import TextPill from '@/search/pills/TextPill';
  import * as filtersUtil from '@/utils/FiltersUtil';

  @Component
  export default class SearchBar extends Vue {
    @Prop({ default: () => [] })
    pills: (KeyValuePill | RangePill | TextPill)[];

    @Prop({ default: 30 })
    suggestionLimit: number;

    @Prop({ default: 'Search...' })
    placeholder: string;

    private lex: Lex = null;

    @Getter getFilters;
    @Action setFilters;

    @Watch('getFilters') onGetFiltersChanged (): void {
      setPills({ lex: this.lex, pills: this.pills, filters: this.getFilters });
    }

    mounted (): void {
      this.lex = initializeLex({
        pills: this.pills,
        onChange: (newFilters) => {
          if (filtersUtil.isEqual(this.getFilters, newFilters) === false) {
            this.setFilters(newFilters);
          }
        },
        placeholder: this.placeholder,
        fieldName: 'Choose a field to search',
        suggestionLimit: this.suggestionLimit,
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
