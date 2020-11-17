<template>
  <div class="hierarchy-slider-container">
    <input type="range" min="1" max="2" step="1" :value="hierarchyLevel" class="slider" @change="setHierarchyLevel">
  </div>
</template>

<script lang="ts">

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  @Component
  export default class HierarchySlider extends Vue {
    @Prop({ default: 1 }) hierarchyLevel: number;

    setHierarchyLevel (e: { target: HTMLInputElement }):void {
      this.$emit('hierarchy-change', +e.target.value);
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.hierarchy-slider-container {
    cursor: pointer;
    z-index: map-get($z-index-order, hierarchy-slider);
    position: absolute;
    top:  calc(#{$navbar-outer-height} + #{$secondary-bar-width} * 3.5);
    left: 10px;
    -webkit-transform:rotate(90deg);
    -moz-transform:rotate(90deg);
    -o-transform:rotate(90deg);
    -ms-transform:rotate(90deg);
    transform:rotate(90deg);

}
</style>
