<template>
  <div class="counters-container">
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';

  @Component
  export default class Counters extends Vue {
  }
</script>

<style lang="scss" scoped>
@import "../styles/variables";

.counters-container {
  height: calc(#{$secondary-bar-width} - 15px);
  background-color: $secondary-bar-bg;
  border: 1px solid rgba(207, 216, 220, .5);
}


</style>