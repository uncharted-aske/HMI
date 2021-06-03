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
          <font-awesome-icon :icon="['fas', 'expand-alt']" />
        </button>
      </div>
    </settings-bar>
    <ul>
      <li v-for="(parameter, index) of parameters" :key="index">
        <h4>{{ parameter.name }}</h4>
        <input type="text" :value="parameter.defaultValue" />
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import * as HMI from '@/types/types';
  // import * as Donu from '@/types/typesDonu';

  import Counters from '@/components/Counters.vue';
  import SettingsBar from '@/components/SettingsBar.vue';

  const components = {
    Counters,
    SettingsBar,
  };

  @Component({ components })
  export default class SimulationParameters extends Vue {
    @Prop({ default: [] }) parameters: HMI.SimulationParameter[];

    get countersTitle (): string {
      return this.parameters.length + ' Parameters';
    }

    get countersData (): HMI.Counter[] {
      const hidden = this.parameters.filter(parameter => parameter?.hidden).length ?? 0;
      if (hidden > 0) {
        return [{ name: 'Hidden', value: 0 }];
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

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    font-weight: bold;
  }
</style>
