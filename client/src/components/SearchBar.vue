<template>
  <div class="search-bar-container">
    <div ref="lexContainer"></div>
  </div>
</template>

<script lang="ts">

  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Getter, Action } from 'vuex-class';
  import { Prop, Watch } from 'vue-property-decorator';
  import _ from 'lodash';
  import { Lex, ValueState } from '@uncharted.software/lex/dist/lex';
  import KeyValuePill from '@/search/pills/KeyValuePill';
  import RangePill from '@/search/pills/RangePill';
  import TextPill from '@/search/pills/TextPill';
  import * as filtersUtil from '@/utils/FiltersUtil';

  @Component
  export default class SearchBar extends Vue {
    @Prop({ default: [] })
    pills: (KeyValuePill | RangePill | TextPill)[];

    @Prop({ default: 30 })
    suggestionLimit: number;

    @Prop({ default: 'Search...' })
    placeholder: string;

    private lex: Lex = null;

    @Getter getFilters;
    @Action setFilters;

    @Watch('getFilters') onGetFiltersChanged (): void {
      this.setQuery();
    }

    mounted (): void {
      const language = Lex.from('field', ValueState, {
        name: 'Choose a field to search',
        suggestions: _.sortBy(this.pills, p => p.searchDisplay).map(pill =>
          pill.makeOption(),
        ),
        suggestionLimit: this.suggestionLimit,
        icon: v => {
          if (_.isNil(v)) return '<i class="fas fa-search"></i>';
          const pill = this.pills.find(
            pill => pill.searchKey === v.meta.searchKey,
          );
          return pill.makeIcon();
        },
      }).branch(...this.pills.map(pill => pill.makeBranch()));

      // Initialize lex instance
      this.lex = new Lex({
        language: language,
        tokenXIcon: '<i class="fas fa-times"></i>',
        placeholder: this.placeholder,
      });

      this.lex.on('query changed', (...args /* [newModel, oldModel, newUnboxedModel, oldUnboxedModel, nextTokenStarted] */) => {
        const newModel = args[0];
        const newFilters = filtersUtil.newFilters();

        newModel.forEach(item => {
          const pill = this.pills.find(
            pill => pill.searchKey === item.field.meta.searchKey,
          );
          if (!_.isNil(pill)) {
            pill.lex2Filters(item, newFilters);
          }
        });

        if (filtersUtil.isEqual(this.getFilters, newFilters) === false) {
          this.setFilters(newFilters);
        }
      });

      // Render our search bar into our desired element
      this.lex.render(this.$refs.lexContainer);
      this.setQuery();
    }

    setQuery (): void {
      if (!this.lex) return;
      const lexQuery = [];
      this.getFilters.clauses.forEach(clause => {
        const pill = this.pills.find(pill => pill.searchKey === clause.field);
        if (!_.isNil(pill)) {
          const selectedPill = pill.makeOption();
          pill.filters2Lex(clause, selectedPill, lexQuery);
        }
      });
      this.lex.setQuery(lexQuery, false);
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
