<template>
  <section class="simulation-parameters-container">
    <settings-bar>
      <div class="btn-group" slot="left" aria-label="Show/Hide Parameters">
        <button
          class="btn btn-primary"
          title="Show all parameters"
          type="button"
          @click="onShowAllParameters"
        >
          <font-awesome-icon :icon="['fas', 'eye']" />
        </button>
        <button
          class="btn btn-primary"
          title="Hide all parameters"
          type="button"
          @click="onHideAllParameters"
        >
          <font-awesome-icon :icon="['fas', 'eye-slash']" />
        </button>
      </div>
      <counters
        slot="middle"
        :title="countersTitle"
        :data="countersData"
      />
      <div slot="right">
        <button
          class="btn btn-primary"
          type="button"
          @click="$emit('settings')">
          Settings
        </button>
        <button
          class="btn btn-primary"
          title="Expand Parameters view"
          type="button"
          @click="$emit('expand')">
          <font-awesome-icon :icon="['fas', (expanded ? 'compress-alt' : 'expand-alt')]" />
        </button>
      </div>
    </settings-bar>
    <ul class="parameters">
      <li
        class="parameter"
        v-for="(parameter, index) of parameters"
        :key="index"
        :class="{ hidden: parameter.hidden }"
      >
        <h4>{{ parameter.name }}</h4>
        <input type="text" :value="parameter.defaultValue" />
        <aside class="btn-group">
          <button type="button" class="btn btn-primary btn-sm">
            <font-awesome-icon :icon="['fas', 'tools']" />
          </button>
          <button
            class="btn btn-primary btn-sm"
            title="(parameter.hidden ? 'Show' : 'Hide' + ' parameter')"
            type="button"
            @click="parameter.hidden = !parameter.hidden"
          >
            <font-awesome-icon :icon="['fas', (parameter.hidden ? 'eye' : 'eye-slash')]" />
          </button>
        </aside>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';

  import * as HMI from '@/types/types';
  import * as Donu from '@/types/typesDonu';

  import Counters from '@/components/Counters.vue';
  import SettingsBar from '@/components/SettingsBar.vue';

  const components = {
    Counters,
    SettingsBar,
  };

  @Component({ components })
  export default class SimulationParameters extends Vue {
    @Prop({ default: [] }) donuParameters: Donu.ModelParameter[];
    @Prop({ default: false }) expanded: boolean;

    parameters: HMI.SimulationParameter[] = [];

    @Watch('donuParameters') onDonuParametersChanged (): void {
      this.parameters = this.donuParameters.map(donuParameter => {
        return { ...donuParameter, hidden: false } as HMI.SimulationParameter;
      });
    }

    get countersTitle (): string {
      return this.parameters.length + ' Parameters';
    }

    get countersData (): HMI.Counter[] {
      const count = this.parameters.filter(parameter => parameter.hidden).length ?? 0;
      if (count === this.parameters.length) {
        return [{ name: 'All hidden' }];
      } else if (count > 0) {
        return [{ name: 'Hidden', value: count }];
      }
    }

    onHideAllParameters (): void {
      this.parameters.forEach(parameter => { parameter.hidden = true; });
    }

    onShowAllParameters (): void {
      this.parameters.forEach(parameter => { parameter.hidden = false; });
    }
  }
</script>

<style lang="scss" scoped>
  .simulation-parameters-container {
    color: white;
    min-width: 10em;
  }

  .parameters {
    list-style: none;
    margin: 0;
    padding: 1em;
  }

  .parameter .btn-group button {
    padding-bottom: 0;
    padding-top: 0;
  }

  .parameter.hidden {
    input {
      display: none;
      pointer-events: none;
    }
  }
</style>
