<template>
  <div class="d-flex model-selector">
    <div class="flex-grow-1">
      <div
        v-for="(parameter, index) of getSimParameters"
        :key="index"
        @click="parameter.edited = !parameter.edited"
      >
        <input type="checkbox" class="mx-2" :checked="parameter.edited" />
        <label>{{ parameter.metadata.name }}</label>
      </div>
    </div>

    <div class="flex-grow-1">
      <div
        v-for="(variable, index) of getSimVariables"
        :key="index"
        @click="variable.hidden = !variable.hidden"
      >
        <input type="checkbox" class="mx-2" :checked="!variable.hidden" />
        <label>{{ variable.metadata.name }}</label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Getter } from 'vuex-class';

  @Component
  export default class ModelSelector extends Vue {
    @Getter getSimParameters;
    @Getter getSimVariables;
  }
</script>

<style scoped>
  .model-selector {
    color: white;
  }

  .model-selector label {
    cursor: pointer;
  }
</style>
