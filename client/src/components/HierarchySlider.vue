<template>
  <div class="hierarchy-slider-container">
    <input type="range" min="1" max="100" value="50" class="slider" >
  </div>
</template>

<script lang="ts">

  import Component from 'vue-class-component';
  import Vue from 'vue';

  @Component
  export default class HierarchySlider extends Vue {
  }
</script>

<style lang="scss" scoped>
@import "../styles/variables";

.hierarchy-slider-container {
    z-index: map-get($z-index-order, hierarchy-slider);
    position: absolute;
    top:  calc(#{$navbar-outer-height} + #{$secondary-bar-width} * 3);
    left: 10px;
    -webkit-transform:rotate(270deg);
    -moz-transform:rotate(270deg);
    -o-transform:rotate(270deg);
    -ms-transform:rotate(270deg);
    transform:rotate(270deg);
}
</style>
