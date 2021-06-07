<template>
  <div class="h-100 w-100 d-flex flex-column">
    <settings-bar>
      <counters
        slot="left"
        title="0 Variables"
        :data="[
          { name: 'Hidden', value: '0' },
        ]"
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
          v-for="(plot, index) in getDonuVariables"
          :key="index"
          :title="plot.name"
          :data="plot"
          :class="`pt-3 pr-3 variable ${plot.hidden ? 'hidden' : ''}`"
        >
          <aside class="btn-group">
            <button type="button" class="btn btn-primary btn-sm">
              <font-awesome-icon :icon="['fas', 'tools']" />
            </button>
            <button
              class="btn btn-primary btn-sm"
              title="(plot.hidden ? 'Show' : 'Hide' + ' parameter')"
              type="button"
              @click="setDonuVariableVisibility(plot.name)"
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
  import Component from 'vue-class-component';
  import { Action, Getter } from 'vuex-class';
  import { Prop, Watch } from 'vue-property-decorator';
  import Vue from 'vue';

  import SettingsBar from '@/components/SettingsBar.vue';
  import Counters from '@/components/Counters.vue';
  import MultiLinePlot from '@/components/widgets/charts/MultiLinePlot.vue';

  import { getModelResult } from '@/services/DonuService';

  import { ModelInterface } from '@/types/types';
  import * as Donu from '@/types/typesDonu';
  import { donuSimulateToD3 } from '@/utils/DonuUtil';

  const components = {
    SettingsBar,
    Counters,
    MultiLinePlot,
  };

  @Component({ components })
  export default class VariablePanel extends Vue {
    @Prop({}) model: ModelInterface;

    @Getter getDonuParameterObject;
    @Action setDonuParameters;

    @Getter getDonuVariables;
    @Action setDonuVariables;
    @Action setDonuVariableVisibility;

    async loadResults (): Promise<void> {
      if (this.model) {
        const response = await getModelResult(this.model, this.getDonuParameterObject);
        this.setDonuVariables(donuSimulateToD3(response));
      }
    }

    @Watch('model') onModelChanged (): void {
      this.loadResults();
    }

    @Watch('getDonuParameterObject') onDonuParametersChanged (): void {
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

  button {
    padding-bottom: 0;
    padding-top: 0;
  }
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
