<template>
  <div class="run-button">
    <button
      class="btn btn-primary blue aske-tooltip aske-tooltip-bottom aske-tooltip-highlight"
      type="button"
      :disabled="disabled"
      :data-tooltip="runButtonTitle"
      @click="onClickRun"
    >
      <font-awesome-icon :icon="['fas', runButtonIcon ]" />
      {{ runButtonText }}
    </button>

    <!-- Extra Commands -->
    <div class="btn-group">
      <button
        class="btn btn-primary aske-tooltip aske-tooltip-bottom"
        data-tooltip="Model Execution Configuration"
        type="button"
        @click="onClickSettings"
      >
        <font-awesome-icon :icon="['fas', 'cog' ]" />
      </button>
      <button
        class="btn btn-primary aske-tooltip aske-tooltip-bottom"
        data-tooltip="Save current run"
        type="button"
        :disabled="disabled"
        @click="onClickSave"
      >
        <font-awesome-icon :icon="['fas', 'bookmark' ]" />
      </button>
      <button
        class="btn btn-primary aske-tooltip aske-tooltip-bottom"
        data-tooltip="Reset all saved runs"
        type="button"
        @click="onClickReset"
      >
        <font-awesome-icon :icon="['fas', 'undo' ]" />
      </button>
    </div>

    <!-- Modal to configure Run configuration -->
    <modal v-if="settingOpen" @close="settingOpen = false">
      <h5 class="header" slot="header">Model Execution Configuration</h5>
      <div slot="body" class="run-config">
        <section>
          <label for="auto-run-input">Auto-Run</label>
          <input type="checkbox" v-model="autoRunInput" id="auto-run-input" />
          <p class="info">Enable model to run automatically when parameters are updated.</p>
        </section>
        <section>
          <label for="start">Start</label>
          <input type="number" id="start" v-model.number="configInput.start" />
          <label for="end">End</label>
          <input type="number" id="end" v-model.number="configInput.end" />
          <label for="step">Step</label>
          <input type="number" id="step" v-model.number="configInput.step" />
        </section>
      </div>
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

    get runButtonText (): string {
      return this.autoRunInput ? 'Auto-Run' : 'Run ';
    }

    get runButtonTitle (): string {
      return this.autoRunInput
        ? 'Execute a model automatically when a Parameter is updated. Caution, this can trigger many request.'
        : 'Execute a model based on Parameters values and display the result in the variables panel.';
    }

    get runButtonIcon (): string {
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

    onClickSettings (): void {
      this.settingOpen = !this.settingOpen;
    }

    onClickSave (): void {
      this.$emit('save');
    }

    onClickReset (): void {
      this.$emit('reset');
    }
  }
</script>

<style scoped>
  .header {
    margin-bottom: 0;
  }

  .run-config {
    align-items: start;
    display: flex;
    justify-content: space-between;
  }

  .run-config section:not(:first-of-type) {
    border-left: var(--border);
    padding: 0 1rem;
  }

  .run-config section:first-of-type {
    padding-right: 1rem;
  }

  .run-config section {
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

  .run-config .info {
    color: var(--text-color-panel-muted);
    font-size: .8em;
    grid-column: 1 / 3;
  }

  /* Overide modal styling */
  .run-button::v-deep .modal-container {
    height: auto;
    max-height: 90vh;
    max-width: 27rem;
    min-width: 40vw;
    width: auto;
  }
</style>
