<template>
  <div class="settings-bar-container">
    <slot name="left" />
    <slot name="middle" />
    <slot name="right" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';

  @Component
  export default class SettingsBar extends Vue {
  }
</script>

<style scoped>
  .settings-bar-container {
    align-items: center;
    display: flex;
    flex-shrink: 0;
    gap: 5px;
    justify-content: space-between;
    min-height: var(--secondary-bar-width);
    padding: 5px;
  }
</style>
