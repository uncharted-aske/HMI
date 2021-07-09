<template>
  <span class="alert alert-info">
    <font-awesome-icon class="spinner" :icon="['fas', 'spinner']" />
    Loading more information
  </span>
</template>

<script>
  import Vue from 'vue';
  export default class LoadingAlert extends Vue {}
</script>

<style scoped>
  .spinner {
    animation-duration: 2s;
    animation-iteration-count: infinite;
    animation-name: spin;
    animation-timing-function: linear;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
