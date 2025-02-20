<template>
  <facetBars
    :label="label"
    :data="data"
    :selection="getSelection"
    :disabled="disabled"
    @handleUpdate="handleFacetUpdated"
  />
</template>

<script lang="ts">

  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Action } from 'vuex-class';
  import { Prop } from 'vue-property-decorator';
  import _ from 'lodash';
  import '@uncharted.software/facets-core';
  import { FacetBars as FacetsFacetBars } from '@uncharted.software/facets-core/dist/types/facet-bars/FacetBars';
  import { FacetBarsBaseData } from '@uncharted.software/facets-core/dist/types/facet-bars-base/FacetBarsBase';

  import FacetBars from '@/components/FacetBars.vue';
  import { binIntervalFromData, binFromValueMap, valuesFromBinMap } from '@/utils/BinUtil';

  const components = {
    FacetBars,
  };

  @Component({ components })
  export default class FacetHistogram extends Vue {
    @Prop({ required: true, type: String }) private label: string;
    @Prop({ required: false, type: String }) private field: string;
    @Prop({ required: true, type: Array }) private data: FacetBarsBaseData;
    @Prop({ required: false, type: Array }) private selection: Array<number>;
    @Prop({ required: false, type: Boolean }) private disabled: boolean;

    @Prop({ required: false, type: Boolean }) private normalized?: boolean;
    @Prop({ required: false, type: Number }) private binMin?: number;
    @Prop({ required: false, type: Number }) private binMax?: number;
    @Prop({ required: false, type: Number }) private binInterval?: number;

    @Action addTerm;
    @Action removeTerm;

    private get _binInterval (): number {
      // eslint-disable-next-line
      // @ts-ignore
      return this.binInterval || binIntervalFromData(_.isArray(this.data) ? this.data.length : 0, this.binMax, this.binMin);
    }

    public get getSelection (): Array<number> {
      return this.normalized && _.isArray(this.selection)
        ? binFromValueMap({
          binInterval: this._binInterval,
          binMax: this.binMax,
          binMin: this.binMin,
          valueArr: this.selection,
        })
        : this.selection;
    }

    public handleFacetUpdated (facetEvent: CustomEvent, facet: FacetsFacetBars): void {
      const changedProperties: Map<string, any> = facetEvent.detail.changedProperties;
      if (changedProperties.has('selection')) {
        let oldSelection: Array<number> = facetEvent.detail.changedProperties.get('selection') || {};
        let newSelection: Array<number> = facet.selection;

        if (_.isArray(newSelection) && newSelection.length === 2) {
          if (this.normalized) {
            newSelection = valuesFromBinMap({ binArr: newSelection, binInterval: this._binInterval, binMin: this.binMin });
            oldSelection = _.isArray(oldSelection)
              ? valuesFromBinMap({ binArr: oldSelection, binInterval: this._binInterval, binMin: this.binMin })
              : oldSelection;
          }

          const field = this.field || 'histogram';
          this.removeTerm({ field, term: oldSelection });
          this.addTerm({ field, term: newSelection });
        }
      }
    }
  }
</script>
