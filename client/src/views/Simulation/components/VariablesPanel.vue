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
            @click="showAllVariables(modelId)"
          >
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
          <button
            class="btn btn-secondary"
            title="Remove all Vsariables"
            type="button"
            :disabled="noDisplayedVariables"
            @click="hideAllVariables(modelId)"
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
        <message-display v-if="!getVariablesRunsCount" class="m-3">
          <span slot="message">
          Click Run to get variables output
          </span>
        </message-display>
        <message-display v-if="noDisplayedVariables" class="m-3">
          <span slot="message">
            Use the model visualization on the left or
            <font-awesome-icon class="icon" :icon="['fas', 'plus']"/> and
            <font-awesome-icon class="icon" :icon="['fas', 'ban']"/>
            buttons above to add/remove variables.
          </span>
        </message-display>
        <multi-line-plot
          v-else
          v-for="(plot, index) in displayedVariables"
          class="pt-2 pl-2 pr-3 plot"
          :class="[{highlighted: plot.metadata.name === highlighted}]"
          :data="plot.values"
          :key="index"
          :styles="plot.styles"
          :title="plot.metadata.name"
        >
          <aside class="btn-group">
            <button
              class="btn btn-secondary btn-sm"
              title="Remove Variable"
              type="button"
              @click="hideVariable({ modelId, selector: plot.uid })"
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
  import MessageDisplay from '@/components/widgets/MessageDisplay.vue';

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
      fill: '#647EA9',
    },
    edge: {
      strokeColor: '#647EA9',
      transitionDuration: 0,
    },
  };

  const NO_LINE_STYLE = {
    edge: {
      strokeWidth: 0,
    },
  };

  const mergeStyle = (...modifyingStyle) => {
    if (modifyingStyle) {
      return _.merge(_.cloneDeep(DEFAULT_STYLE), ...modifyingStyle);
    }
    return DEFAULT_STYLE;
  };

  const components = {
    SettingsBar,
    Counters,
    MultiLinePlot,
    MessageDisplay,
  };

  @Component({ components })
  export default class VariablesPanel extends Vue {
    @Prop({ default: false }) expanded: boolean;
    @Prop({ default: null }) modelId: number;
    @Prop({ default: null }) highlighted: string;
    @InjectReactive() resized!: boolean;

    @Getter getSimModel;
    @Getter getVariablesRunsCount;
    @Action hideVariable;
    @Action hideAllVariables;
    @Action showAllVariables;

    get variables (): HMI.SimulationVariable[] {
      let variables = this.getSimModel(this.modelId).variables;
      variables = _.cloneDeep(variables);
      variables.map(variable => {
        variable.styles = variable.styles || [];
        for (let i = 0; i < variable.values.length; i++) {
          if (variable.values.length > 5) {
            i !== variable.values.length - 1
              ? variable.styles.push(mergeStyle(OTHER_STYLE, NO_LINE_STYLE))
              : variable.styles.push(mergeStyle());
          } else {
            variable.styles.push(mergeStyle(i !== variable.values.length - 1 && OTHER_STYLE));
          }
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

  .btn-settings {
    height: 25px;
    line-height: 0;
  }

  .run-counter {
    color: var(--text-color-light);
    font-size: .8em;
    margin-right: 1rem;
  }

  .plot {
    border: 1px solid transparent;
  }
  .plot.highlighted {
    border-color: var(--selection);
  }
</style>
