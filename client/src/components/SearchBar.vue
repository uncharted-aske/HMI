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
  import _ from 'lodash';
  import { Lex, ValueState } from '@uncharted.software/lex/dist/lex';
  import KeyValuePill from '../search/pills/KeyValuePill';
  import { QUERY_FIELDS_MAP } from '../utils/QueryFieldsUtil';
  import * as filtersUtil from '../utils/FiltersUtil';
  import * as modelTypeUtil from '../utils/ModelTypeUtil';

  @Component
  export default class SearchBar extends Vue {
    private lex: Lex = null;
    private pills: KeyValuePill[] = [];

    @Getter getFilters;
    @Action setFilters;

    @Watch('getFilters') onGetFiltersChanged (): void {
      this.setQuery();
    }

    mounted (): void {
      this.pills = [
        new KeyValuePill(
          QUERY_FIELDS_MAP.MODEL_TYPE,
          modelTypeUtil.MODEL_TYPE_OPTIONS,
          'Select model type..',
        ),
      ];

      const language = Lex.from('field', ValueState, {
        name: 'Choose a field to search',
        suggestions: _.sortBy(this.pills, p => p.searchDisplay).map(pill =>
          pill.makeOption(),
        ),
        suggestionLimit: 30,
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
@import "../styles/variables";

.search-bar-container {
  height: $secondary-bar-width;
  background-color: $secondary-bar-bg;
  border: 1px solid rgba(207, 216, 220, .5);
}

.search-bar-container::v-deep .lex-box {
  height: $secondary-bar-width;
  box-shadow: none;
  border-color: $selection;
}

.search-bar-container::v-deep .lex-box:not(.active) {
  border: none;
}

</style>

<style lang="scss">
// Note: Scoped imports not attached to rendered elements
@import "@uncharted.software/lex/dist/lex.scss";

</style>
