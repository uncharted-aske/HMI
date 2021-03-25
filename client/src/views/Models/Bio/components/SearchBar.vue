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
  import { initializeLex, setPills } from '@/utils/LexUtil';
  import { Lex } from '@uncharted.software/lex/dist/lex';
  import * as filtersUtil from '@/utils/FiltersUtil';
  import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
  import { BOOLEAN_OPTIONS } from '@/utils/ModelTypeUtil';
  import { loadBGraphData, filterToBgraph } from '@/utils/BGraphUtil';
  import TextPill from '@/search/pills/TextPill';
  import KeyValuePill from '@/search/pills/KeyValuePill';
  import { bgraph } from '@uncharted.software/bgraph';

  function deepCopy (inObject, keyBlackList?: Array<any>): any {
    let value, key;

    if (typeof inObject !== 'object' || inObject === null) {
      return inObject; // Return the value if inObject is not an object
    }

    // Create an array or object to hold the values
    const isArray = Array.isArray(inObject);
    const outObject = isArray ? [] : {};

    for (key in inObject) {
      if (!isArray && keyBlackList?.includes(key)) {
        // Object property should not be deep copied
        continue;
      }

      value = inObject[key];
      // Recursively (deep) copy for nested objects, including arrays
      outObject[key] = deepCopy(value, keyBlackList);
    }

    return outObject;
  }

  @Component
  export default class SearchBar extends Vue {
    private lex: Lex = null;
    private pills: any = [];
    private bgraphInstance: any = undefined;

    @Getter getFilters;
    @Action setFilters;

    @Watch('getFilters') async onGetFiltersChanged (): Promise<void> {
      setPills({ lex: this.lex, pills: this.pills, filters: this.getFilters });
      if (this.bgraphInstance) {
        this.$emit('subgraph', deepCopy(filterToBgraph(this.bgraphInstance, this.getFilters), ['_in', '_out']));
      }
    }

    async mounted (): Promise<void> {
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

      const [bgNodes, bgEdges] = await loadBGraphData();
      this.bgraphInstance = bgraph.graph(bgNodes, bgEdges);
      if (this.bgraphInstance) {
        this.$emit('subgraph', deepCopy(filterToBgraph(this.bgraphInstance, this.getFilters), ['_in', '_out']));
      }
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
