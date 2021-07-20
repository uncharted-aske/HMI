<template>
  <section class="simulation-variables-panel">
    <settings-bar>
      <counters
        slot="left"
        :title="countersTitle"
        :data="countersData"
      />
      <aside slot="right">
        <span class="run-counter" v-if="getVariablesRunsCount">{{ runCounter }}</span>
        <div class="btn-group" title="Add/Remove Variables">
          <button
            class="btn btn-secondary"
            title="Add all Variables"
            type="button"
            :disabled="allVariablesAreDisplayed"
            @click="showAllVariables"
          >
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
          <button
            class="btn btn-secondary"
            title="Remove all Vsariables"
            type="button"
            :disabled="noDisplayedVariables"
            @click="hideAllVariables"
          >
            <font-awesome-icon :icon="['fas', 'ban']" />
          </button>
        </div>
        <button
          class="btn btn-secondary"
          title="Expand Parameters Panel"
          type="button"
          @click="$emit('expand')">
          <font-awesome-icon :icon="['fas', (expanded ? 'compress-alt' : 'expand-alt')]" />
        </button>
      </aside>
    </settings-bar>

    <div class="position-relative d-flex flex-column scatterplot-chart-container">
      <div class="position-absolute h-100 w-100 overflow-auto">
        <div
          v-if="!getVariablesRunsCount"
          class="alert alert-info m-3" role="alert"
        >
          Click Run to get variables output.
        </div>
        <div v-else-if="noDisplayedVariables" class="alert alert-info m-3">
          Use the model visualization on the left to add/remove variables.
        </div>
        <multi-line-plot
          v-else
          v-for="(plot, index) in displayedVariables"
          :key="index"
          :title="plot.metadata.name"
          :data="plot.values"
          :styles="plot.styles"
          :class="`pt-3 pr-3 variable ${plot.hidden ? 'hidden' : ''}`"
        >
          <aside class="btn-group">
            <button
              class="btn btn-secondary btn-sm"
              title="Remove Variable"
              type="button"
              @click="hideVariable(plot.uid)"
            >
              <font-awesome-icon :icon="['fas', 'ban']" />
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
    @InjectReactive() resized!: boolean;

    @Getter getSimVariables;
    @Getter getVariablesRunsCount;
    @Action hideVariable;
    @Action hideAllVariables;
    @Action showAllVariables;

    get variables (): HMI.SimulationVariable[] {
      const variables = _.cloneDeep(this.getSimVariables);
      variables.map(variable => {
        variable.styles = variable.styles || [];
        for (let i = 0; i < variable.values.length; i++) {
          variable.styles.push(mergeStyle(i !== variable.values.length - 1 && OTHER_STYLE));
        }

        if (variable.aggregate) {
          variable.values.push(variable.aggregate);
          variable.styles.push(mergeStyle(AGGREGATE_STYLE));
        }
      });

      return _.orderBy(variables, ['metadata.name'], ['asc']);
    }

    get displayedVariables (): HMI.SimulationVariable[] {
      return this.variables.filter(variable => variable.edited);
    }

    get noDisplayedVariables (): boolean {
      return this.displayedVariables.length === 0;
    }

    get allVariablesAreDisplayed (): boolean {
      return this.displayedVariables.length === this.variables.length;
    }

    get countersTitle (): string {
      const count = this.displayedVariables.length;
      return `${count > 0 ? count : '—'} Variable${count > 1 ? 's' : ''}`;
    }

    get countersData (): HMI.Counter[] {
      const displayed = this.displayedVariables.length;
      const total = this.variables.length;
      if (displayed < total) {
        return [{ name: 'total', value: total }];
      }
    }

    get runCounter (): string {
      const count = this.getVariablesRunsCount;
      return `${count} run${count > 1 ? 's' : ''}`;
    }
  }
</script>

<style scoped>
  .scatterplot-chart-container {
    flex: 1;
    background-color: var(--bg-graphs);
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

  .run-counter {
    color: var(--text-color-light);
    font-size: .8em;
    margin-right: 1rem;
  }

  .chart {
    height: auto;
  }
</style>
