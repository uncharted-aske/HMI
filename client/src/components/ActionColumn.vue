<template>
  <div class="action-column-container">
    <slot name="actions" />
    <slot name="panel" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';

  @Component
  export default class ActionColumn extends Vue {
  }
</script>

<style lang="scss" scoped>
@import "../styles/variables";

.action-column-container {
  width: $secondary-bar-width;
  height: 100%;
}

</style>
