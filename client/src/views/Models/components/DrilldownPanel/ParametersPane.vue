<template>
  <section class="parameters-pane-container">
    <aside class="dropdown">
      <button
        type="button"
        class="btn btn-primary dropdown-toggle"
        @click="toggleVariableDropdown"
      >
        {{ selectedVariable }}
      </button>
      <ul
        class="dropdown-menu"
        :class="{ show: isVariableDropdownOpen }"
      >
        <li
          v-for="(variable, index) in getVariables" :key="index"
          class="dropdown-item"
          @click="setSelectedVariable(variable)"
        >
          {{ variable }}
        </li>
      </ul>
    </aside>
    <message-display v-if="noSelectedData">
      No data to display.
    </message-display>
    <scatter-plot v-else :data="selectedData" @dot-click="onDotClick" />

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

    data = PARAMETERS_EXTRACT.data;
    isVariableDropdownOpen: boolean = false;
    selectedVariable: string = null;

    mounted (): void {
      this.selectedVariable = 'Ro';
    }

    get getVariables (): string[] {
      return Array.from(new Set(this.data.map(info => info.variable))).sort();
    }

    get selectedData (): HMI.ExtractDataParameter {
      return this.data
        .filter(info => info.variable === this.selectedVariable)
        .map(info => {
          return {
            date: info.date + ' - ' + info.year,
            doi: info.doi,
            location: info.location,
            object_id: info.object_id,
            value: info.value,
          };
        });
    }

    get noSelectedData (): boolean {
      return !this.selectedData || this.selectedData.length < 1;
    }

    get noRelatedParameter (): boolean {
      return !this.related || this.related.length === 0;
    }

    toggleVariableDropdown (): void {
      this.isVariableDropdownOpen = !this.isVariableDropdownOpen;
    }

    setSelectedVariable (variable: string): void {
      this.selectedVariable = variable;
      this.isVariableDropdownOpen = false;
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

  .dropdown-toggle {
    white-space: initial;
    width: 100%;
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
