<template>
  <div class="settings-container">
    <button type="button" class="btn btn-secondary" disabled>Views</button>
    <button type="button" class="btn btn-secondary" disabled>Layouts</button>
    <button type="button" class="btn btn-secondary" disabled>Settings</button>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  //   import { Prop } from 'vue-property-decorator';

  const components = {

  };
  @Component({ components })
  export default class Settings extends Vue {

  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.settings-container {
  align-items: center;
  display: flex;
  gap: 5px;
  position: relative;

  .view-name {
    font-weight: bold;
  }
}

.dropdown-settings {
  align-items: center;
  display: flex;
  height: calc(#{$secondary-bar-width});
  padding: 10px;
  position: absolute;
  top: calc(#{$secondary-bar-width} - 15px);
}

</style>
