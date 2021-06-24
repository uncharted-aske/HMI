<template>
  <div class="d-flex model-selector">
    <div class="flex-grow-1">
      <div class="button-group" v-for="(parameter) of getSimParameters" @click="clickHandler(parameter)" :key="parameter.name">
        <input type="checkbox" class="mx-2" :checked="!parameter.hidden" />
        <label>{{parameter.name}}</label>
      </div>
    </div>

    <div class="flex-grow-1">
      <div v-for="(variable) of getSimVariables" @click="clickHandler(variable)" :key="variable.name">
        <input type="checkbox" class="mx-2" :checked="!variable.hidden" />
        <label>{{variable.name}}</label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Getter } from 'vuex-class';
  import * as HMI from '@/types/types';

  @Component
  export default class ModelSelector extends Vue {
    @Getter getSimParameters;
    @Getter getSimVariables;

    clickHandler (parameter: HMI.SimulationParameter | HMI.SimulationVariable): void {
      parameter.hidden = !parameter.hidden;
    }
  }
</script>

<style scoped>
  .model-selector {
    color: white;
  }

  .button-group {
    cursor: pointer;
  }
</style>
