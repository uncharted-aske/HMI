<template>
  <div class="btn-group">
    <button
      type="button"
      class="btn btn-primary"
      :class="{ 'blue' : !autoRunInput }"
      @click="onClickRun"
    >
      <font-awesome-icon :icon="['fas', ( autoRunInput ? 'pause' : 'play') ]" />
      {{ displayText }}
    </button>
    <button
      type="button"
      class="btn btn-primary blue dropdown-toggle dropdown-toggle-split"
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
      <h6 class="dropdown-header">Model view</h6>
      <!-- <div v-for="(view, index) in views" :key="index" class="custom-control custom-radio">
        <input
          class="custom-control-input"
          name="model-view"
          type="radio"
          v-model="selectedView"
          :id="('model-view-'+index)"
          :value="view.id"
        >
        <label class="custom-control-label" :for="('model-view-'+index)">{{ view.name }}</label>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { PropSync } from 'vue-property-decorator';

  @Component
  export default class RunButton extends Vue {
    @PropSync('autoRun', { type: Boolean }) autoRunInput!: boolean; // eslint-disable-line new-cap

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
</style>
