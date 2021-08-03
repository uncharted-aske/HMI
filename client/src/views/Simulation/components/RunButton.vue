<template>
  <div class="run-button btn-group">
    <button
      type="button"
      class="btn btn-primary blue"
      :disabled="disabled"
      @click="onClickRun"
    >
      <font-awesome-icon :icon="['fas', displayIcon ]" />
      {{ displayText }}
    </button>
    <button
      type="button"
      class="btn btn-primary"
      @click="settingOpen = !settingOpen"
    >
      <font-awesome-icon :icon="['fas', 'cog' ]" />
    </button>

    <modal v-if="settingOpen" @close="settingOpen = false">
      <h5 class="header" slot="header">Model Execution Settings</h5>
      <section slot="body" class="run-config">
        <label for="auto-run-input" title="Enable model to run automatically on when Parameters are updated">Auto-Run</label>
        <input type="checkbox" v-model="autoRunInput" id="auto-run-input" />
        <label for="start">Start</label>
        <input type="number" id="start" v-model.number="configInput.start" />
        <label for="end">End</label>
        <input type="number" id="end" v-model.number="configInput.end" />
        <label for="step">Step</label>
        <input type="number" id="step" v-model.number="configInput.step" />
      </section>
    </modal>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, PropSync } from 'vue-property-decorator';
  import * as Donu from '@/types/typesDonu';
  import Modal from '@/components/Modal.vue';

  const components = {
    Modal,
  };

  @Component({ components })
  export default class RunButton extends Vue {
    @PropSync('autoRun', { type: Boolean }) autoRunInput!: boolean;
    @PropSync('config', { type: Object }) configInput!: Donu.RequestConfig;
    @Prop({ default: false }) disabled: boolean;

    settingOpen: boolean = false;

    get displayText (): string {
      return this.autoRunInput ? 'Auto-Run' : 'Run ';
    }

    get displayIcon (): string {
      return this.autoRunInput ? 'pause' : 'play';
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
  .header {
    margin-bottom: 0;
  }

  .run-config {
    align-items: center;
    display: grid;
    font-size: .9em;
    gap: .25em;
    grid-template-columns: 5em auto;
    justify-items: start;
  }

  /* Align the label with the inputs */
  .run-config label {
    line-height: 2;
    margin: 0;
  }

  /* Overide modal styling */
  .run-button::v-deep .modal-container {
    height: auto;
    max-height: 90vh;
    width: auto;
  }
</style>
