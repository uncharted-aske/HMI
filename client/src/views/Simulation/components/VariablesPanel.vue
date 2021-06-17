<template>
  <div class="h-100 w-100 d-flex flex-column">
    <settings-bar>
      <counters
        slot="left"
        :title="countersTitle"
        :data="countersData"
      />
      <div slot="right">
        <button type="button" class="btn btn-primary btn-settings">Settings</button>
        <button type="button" class="btn btn-primary py-0 btn-settings" @click="$emit('expand')">
          <i class="fas fa-expand-alt"/>
        </button>
      </div>
    </settings-bar>

    <div class="position-relative d-flex flex-column scatterplot-chart-container">
      <div class="position-absolute h-100 w-100 overflow-auto">
        <multi-line-plot
          v-for="(plot, index) in simVariables"
          :key="index"
          :title="plot.name"
          :data="plot.values"
          :styles="plot.styles"
          :class="`pt-3 pr-3 variable ${plot.hidden ? 'hidden' : ''}`"
        >
          <aside class="btn-group">
            <button type="button" class="btn btn-primary btn-sm">
              <font-awesome-icon :icon="['fas', 'tools']" />
            </button>
            <button
              class="btn btn-primary btn-sm"
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
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';
  import Component from 'vue-class-component';
  import { Action, Getter } from 'vuex-class';
  import { InjectReactive, Prop, Watch } from 'vue-property-decorator';
  import Vue from 'vue';

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
    @Prop({}) model: ModelInterface;
    @InjectReactive() resized!: boolean; // eslint-disable-line new-cap

    @Getter getSimParametersCount;
    @Getter getSimParameterArray;

    @Getter getSimVariables;
    @Getter getSimVariablesAggregate;
    @Action setSimVariables;
    @Action setSimVariableVisibility;
    @Action fetchModelResults;

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
          simVariable.values = [...simVariableAggregate.values, ...simVariable.values];
          simVariable.styles.unshift(mergeStyle(AGGREGATE_STYLE));
        });
      }

      return _.orderBy(simVariables, ['name'], ['asc']);
    }

    get countersTitle (): string {
      return this.getSimVariables.length + ' Variables';
    }

    get countersData (): Counter[] {
      const count = this.getSimVariables.filter(variable => variable.hidden).length ?? 0;
      if (count === this.getSimVariables.length) {
        return [{ name: 'All hidden' }];
      } else if (count > 0) {
        return [{ name: 'Hidden', value: count }];
      }
    }

    async loadResults (): Promise<void> {
      if (this.model) {
        this.fetchModelResults({ model: this.model });
      }
    }

    @Watch('resized') onResponsiveGridResizing (): void {
      if (this.resized) {
        this.loadResults();
      }
    }

    @Watch('model') onModelChanged (): void {
      this.loadResults();
    }

    @Watch('getSimParameterArray') onDonuParametersChanged (): void {
      this.loadResults();
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
