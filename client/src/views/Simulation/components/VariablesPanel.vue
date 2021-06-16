<template>
  <section class="simulation-variables-panel">
    <settings-bar>
      <counters
        slot="left"
        :title="countersTitle"
        :data="countersData"
      />
      <div slot="right">
        <button type="button" disabled class="btn btn-primary btn-settings">Settings</button>
        <button type="button" class="btn btn-primary py-0 btn-settings" @click="$emit('expand')">
          <font-awesome-icon :icon="['fas', (expanded ? 'compress-alt' : 'expand-alt')]" />
        </button>
      </div>
    </settings-bar>

    <div class="position-relative d-flex flex-column scatterplot-chart-container">
      <div class="position-absolute h-100 w-100 overflow-auto">
        <multi-line-plot
          v-for="(plot, index) in sortedSimVariables"
          :key="index"
          :title="plot.name"
          :data="plot.values"
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

  const components = {
    SettingsBar,
    Counters,
    MultiLinePlot,
  };

  @Component({ components })
  export default class VariablePanel extends Vue {
    @Prop({ default: false }) expanded: boolean;
    @InjectReactive() resized!: boolean; // eslint-disable-line new-cap

    @Getter getSimVariables;
    @Action setSimVariableVisibility;
    @Action getModelResults;

    get sortedSimVariables (): HMI.SimulationVariable[] {
      return _.orderBy(this.getSimVariables, ['name'], ['asc']);
    }

    get countersTitle (): string {
      return this.getSimVariables.length + ' Variables';
    }

    get countersData (): HMI.Counter[] {
      const count = this.getSimVariables.filter(variable => variable.hidden).length ?? 0;
      if (count === this.getSimVariables.length) {
        return [{ name: 'All hidden' }];
      } else if (count > 0) {
        return [{ name: 'Hidden', value: count }];
      }
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
