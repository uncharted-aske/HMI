<template>
  <section class="simulation-variables-panel">
    <settings-bar>
      <counters
        slot="left"
        :title="countersTitle"
        :data="countersData"
      />
      <div slot="right">
        <button type="button" disabled class="btn btn-secondary btn-settings">Settings</button>
        <button type="button" class="btn btn-secondary py-0 btn-settings" @click="$emit('expand')">
          <font-awesome-icon :icon="['fas', (expanded ? 'compress-alt' : 'expand-alt')]" />
        </button>
      </div>
    </settings-bar>

    <div class="position-relative d-flex flex-column scatterplot-chart-container">
      <div class="position-absolute h-100 w-100 overflow-auto">
        <div
          v-if="!hasVariablesRuns"
          class="alert alert-info" role="alert"
        >
          Click `Run` to get variables output.
        </div>
        <multi-line-plot
          v-else
          v-for="(plot, index) in simVariables"
          :key="index"
          :title="plot.name"
          :data="plot.values"
          :styles="plot.styles"
          :class="`pt-3 pr-3 variable ${plot.hidden ? 'hidden' : ''}`"
        >
          <aside class="btn-group">
            <button type="button" class="btn btn-secondary btn-sm">
              <font-awesome-icon :icon="['fas', 'tools']" />
            </button>
            <button
              class="btn btn-secondary btn-sm"
              :title="(plot.hidden ? 'Show' : 'Hide' + ' parameter')"
              type="button"
              @click="setSimVariableVisibility(plot.name)"
            >
              <font-awesome-icon :icon="['fas', (plot.hidden ? 'eye' : 'eye-slash')]" />
            </button>
          </aside>
        </multi-line-plot>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
  import _ from 'lodash';
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { InjectReactive, Prop } from 'vue-property-decorator';
  import { Action, Getter } from 'vuex-class';

  import * as HMI from '@/types/types';

  import SettingsBar from '@/components/SettingsBar.vue';
  import Counters from '@/components/Counters.vue';
  import MultiLinePlot from '@/components/widgets/charts/MultiLinePlot.vue';
  import { Colors } from '@/graphs/svg/encodings';

  import { ModelInterface, SimulationVariable, Counter } from '@/types/types';

  const DEFAULT_STYLE = {
    node: {
      fill: Colors.NODES.DEFAULT,
      stroke: Colors.STROKE,
      strokeWidth: 1,
      borderRadius: 5,
    },
    edge: {
      fill: 'none',
      strokeWidth: 2.5,
      strokeColor: Colors.NODES.DEFAULT,
      transitionDuration: 500,
    },
    label: {
      text: Colors.LABELS.LIGHT,
    },
  };

  const AGGREGATE_STYLE = {
    node: {
      fill: Colors.NODES.AGGREGATE,
    },
    edge: {
      strokeColor: Colors.NODES.AGGREGATE,
    },
  };

  const OTHER_STYLE = {
    node: {
      fill: Colors.NODES.OTHER,
    },
    edge: {
      strokeColor: Colors.NODES.OTHER,
      transitionDuration: 0,
    },
  };

  const mergeStyle = modifyingStyle => {
    if (modifyingStyle) {
      return _.merge(_.cloneDeep(DEFAULT_STYLE), modifyingStyle);
    }

    return DEFAULT_STYLE;
  };

  const components = {
    SettingsBar,
    Counters,
    MultiLinePlot,
  };

  @Component({ components })
  export default class VariablesPanel extends Vue {
    @Prop({ default: false }) expanded: boolean;
    @InjectReactive() resized!: boolean; // eslint-disable-line new-cap

    @Getter getSimVariables;
    @Getter hasVariablesRuns;
    @Getter getSimParametersCount;
    @Getter getSimVariablesAggregate;
    @Action setSimVariableVisibility;

    get simVariables (): SimulationVariable[] {
      const simVariables = this.getSimVariables;

      simVariables.map(simVariable => {
        simVariable.styles = simVariable.styles || [];
        for (let i = 0; i < simVariable.values.length; i++) {
          simVariable.styles.push(mergeStyle(i !== simVariable.values.length - 1 && OTHER_STYLE));
        }
      });

      if (this.getSimParametersCount > 1) {
        this.getSimVariablesAggregate.map((simVariableAggregate, i) => {
          const simVariable = simVariables[i];
          simVariable.values = [...simVariable.values, ...simVariableAggregate.values];
          simVariable.styles.push(mergeStyle(AGGREGATE_STYLE));
        });
      }

      return _.orderBy(simVariables, ['name'], ['asc']);
    }

    get countersTitle (): string {
      const count = this.getSimVariables.length;
      return (count > 0 ? count : '—') + ' Variables';
    }

    get countersData (): HMI.Counter[] {
      const count = this.getSimVariables.length;
      if (count > 0) {
        const hidden = this.getSimVariables.filter(variable => variable.hidden).length ?? 0;
        if (hidden === count) {
          return [{ name: 'All hidden' }];
        } else if (hidden > 0) {
          return [{ name: 'Hidden', value: hidden }];
        }
      } else return [];
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

  .scatterplot-chart-container {
    flex: 1;
    background-color: $bg-graphs;
  }

  .variable .btn-group {
    grid-area: action;
  }

  .variable.hidden {
    opacity: 0.5;
  }

  .btn-settings {
    height: 25px;
    line-height: 0;
  }

  .chart {
    height: auto;
  }
</style>
