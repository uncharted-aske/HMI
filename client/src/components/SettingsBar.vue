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
  height: calc(#{$secondary-bar-width} - 15px);
  background-color: $secondary-bar-bg;
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  padding: 0 10px;
  justify-content: space-between;

  ::v-deep > div {
    height: 100%;
  }
}

</style>
