<template>
  <div class="collapsible-container">
    <template v-if="!isEmpty">
      <slot name="item"/>
    </template>

    <slot v-else name="empty"/>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  @Component
  export default class CollapsibleContainer extends Vue {
    @Prop({ default: false }) isEmpty: any;
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.collapsible-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
