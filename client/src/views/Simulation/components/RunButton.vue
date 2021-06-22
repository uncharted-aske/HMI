<template>
  <div class="btn-group">
    <button
      type="button"
      class="btn btn-primary blue"
      @click="onClickRun"
    >
      <font-awesome-icon :icon="['fas', ( autoRunInput ? 'pause' : 'play') ]" />
      {{ displayText }}
    </button>
    <button
      type="button"
      class="btn btn-primary blue dropdown-toggle dropdown-toggle-split"
      :class="{ 'open': dropdownOpen }"
      @click="dropdownOpen = !dropdownOpen"
    />
    <div class="dropdown-menu dropdown-menu-right" :class="{ 'show': dropdownOpen }">
      <input type="checkbox" v-model="autoRunInput" id="auto-run-input" />
      <label
        for="auto-run-input"
        title="Enable model to run automatically on when Parameters are updated">
        Auto-Run
      </label>
      <div class="dropdown-divider" />
      <h6 class="dropdown-header">Model Execution Settings</h6>
      <div class="run-config">
        <label for="run-config-start">Start</label>
        <input type="number" id="run-config-start" v-model.number="configInput.start" />
        <label for="run-config-end">End</label>
        <input type="number" id="run-config-end" v-model.number="configInput.end" />
        <label for="run-config-step">Step</label>
        <input type="number" id="run-config-step" v-model.number="configInput.step" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { PropSync } from 'vue-property-decorator';
  import * as Donu from '@/types/typesDonu';

  @Component
  export default class RunButton extends Vue {
    @PropSync('autoRun', { type: Boolean }) autoRunInput!: boolean;
    @PropSync('config', { type: Object }) configInput!: Donu.RequestConfig;

    dropdownOpen: boolean = false;

    get displayText (): string {
      return this.autoRunInput ? 'Auto-Run' : 'Run';
    }

    /* On auto-run, remove the auto-run feature, otherwise, run the simulation. */
    onClickRun (): void {
      if (this.autoRunInput) {
        this.autoRunInput = !this.autoRunInput;
      } else {
        this.$emit('run');
      }
    }
  }
</script>

<style scoped>
  .dropdown-menu {
    padding: 1em;
  }

  .dropdown-header {
    padding: 0 1.5em .5em 0;
  }

  /* Make the caret bigger */
  .dropdown-toggle {
    font-size: 1.5em;
  }

  /* Reverse the caret when open */
  .dropdown-toggle.open::after {
    border-bottom: 0.3em solid;
    border-top: 0;
  }

  .run-config {
    display: grid;
    font-size: .9em;
    gap: .25em;
    grid-template-columns: 3em auto;
  }

  /* Align the label with the inputs */
  .run-config label {
    line-height: 2;
    margin: 0;
  }
</style>
