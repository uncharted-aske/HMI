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
          <!-- <font-awesome-icon :icon="['fas', 'eye']" /> -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-eye fa-w-14">
            <path fill="currentColor" d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path>
          </svg>
        </button>
        <button
          class="btn btn-primary"
          title="Hide all parameters"
          type="button"
          @click="onHideAllParameters"
        >
          <!-- <font-awesome-icon :icon="['fas', 'eye-slash']" /> -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="svg-inline--fa fa-eye-slash fa-w-14">
            <path fill="currentColor" d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"></path>
          </svg>
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
            <!-- <font-awesome-icon :icon="['fas', 'cog']" /> -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-cog fa-w-14">
              <path fill="currentColor" d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"></path>
            </svg>
          </button>
          <button
            class="btn btn-primary btn-sm"
            title="(parameter.hidden ? 'Show' : 'Hide' + ' parameter')"
            type="button"
            @click="parameter.hidden = !parameter.hidden"
          >
            <!-- <font-awesome-icon :icon="['fas', (parameter.hidden ? 'eye' : 'eye-slash')]" /> -->
            <svg v-if="parameter.hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-eye fa-w-14">
              <path fill="currentColor" d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="svg-inline--fa fa-eye-slash fa-w-14">
              <path fill="currentColor" d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"></path>
            </svg>
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

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
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
