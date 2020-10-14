<template>
  <div class="counters-container">
    {{nodeCount}} - {{edgeCount}}
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';


  @Component
  export default class Counters extends Vue {
    @Prop({ default: 0 }) nodeCount: number;
    @Prop({ default: 0 }) edgeCount: number;

  }
</script>

<style lang="scss" scoped>
@import "../styles/variables";

.counters-container {
  height: calc(#{$secondary-bar-width} - 15px);
  background-color: $secondary-bar-bg;
  border: 1px solid rgba(207, 216, 220, .5);
  display: flex;
  align-items: center;
  // padding: 5px;
  // margin-left: 15px;

}

</style>
