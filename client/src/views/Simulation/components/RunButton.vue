<template>
  <div class="dropdown">
    <button
      class="btn btn-primary blue dropdown-toggle"
      type="button"
      @click="dropdownOpen = !dropdownOpen">
      <font-awesome-icon :icon="['fas', 'play' ]" />
      {{ displayText }}
    </button>
    <div class="dropdown-menu dropdown-menu-right" :class="{ 'show': dropdownOpen }">
      <h6 class="dropdown-header">Model view</h6>
      <div v-for="(view, index) in views" :key="index" class="custom-control custom-radio">
        <input
          class="custom-control-input"
          name="model-view"
          type="radio"
          v-model="selectedView"
          :id="('model-view-'+index)"
          :value="view.id"
        >
        <label class="custom-control-label" :for="('model-view-'+index)">{{ view.name }}</label>
      </div>
    </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';

  @Component
  export default class RunButton extends Vue {
    dropdownOpen: boolean = false;

    get displayText (): string {
      return 'Run';
    }
  }
</script>
