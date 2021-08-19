<template>
  <section class="parameters-pane-container">
    <scatter-plot :data="selectedData" size="[400, 500]" @dot-click="onDotClick"/>

    <h6>Related Parameters</h6>
    <message-display v-if="noRelatedParameter">
      No <strong>Related Parameters</strong> at the moment.
    </message-display>
    <ul v-else class="related-parameters">
      <li v-for="(param, index) in related" :key="index">
        <strong>{{ param[0] | underscore-remover-formatter | capitalize-first-letter-formatter }}</strong>
        {{ param[1] }}
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import * as HMI from '@/types/types';
  import MessageDisplay from '@/components/widgets/MessageDisplay.vue';
  import ScatterPlot from '@/components/widgets/charts/ScatterPlot.vue';

  // Source: http://teststrata.geology.wisc.edu/xdd/extract.php?doc_set=xdd-covid-19
  import * as PARAMETERS_EXTRACT from '@/static/parameters_extract.json';

  const components = {
    MessageDisplay,
    ScatterPlot,
  };

  @Component({ components })
  export default class ParametersPane extends Vue {
    @Prop({ default: null }) related: [string, number][];
    private selectedVariable: string = 'incubation period';

    get getVariables (): string[] {
      return Array.from(new Set(PARAMETERS_EXTRACT.map(info => info.variable)));
    }

    get selectedData (): HMI.ExtractDataParameter {
      return PARAMETERS_EXTRACT.map(info => {
        if (info.variable === this.selectedVariable) {
          return {
            date: info.date + ' - ' + info.year,
            doi: info.doi,
            location: info.location,
            object_id: info.object_id,
            value: info.value,
          };
        }
      });
    }

    get noRelatedParameter (): boolean {
      return !this.related || this.related.length === 0;
    }

    onDotClick (doi:string): void {
      this.$emit('open-modal', doi);
    }
  }
</script>

<style scoped>
  .parameters-pane-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 5px;
  }

  h6 {
    font-weight: bold;
  }

  .related-parameters {
    list-style: none;
    margin: 0;
    overflow-y: scroll;
    padding: 0;
    width: 100%;
  }

  .related-parameters li {
    border: var(--border);
    border-radius: .3em;
    margin-bottom: .25em;
    padding: .5em;
  }

  .related-parameters strong {
    display: block;
  }
</style>
