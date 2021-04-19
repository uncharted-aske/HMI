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
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  min-height: calc(#{$secondary-bar-width} - 15px);
  padding: 0 10px;

  ::v-deep > div {
    height: 100%;
  }
}

</style>
