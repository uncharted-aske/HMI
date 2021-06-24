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

<style lang="scss" scoped>
@import "@/styles/variables";

.settings-bar-container {
  display: flex;
  flex-shrink: 0;
  gap: 5px;
  justify-content: space-between;
  min-height: $secondary-bar-width;
  padding: 5px;
}
</style>
