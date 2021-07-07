<template>
  <span class="alert alert-info">
    Loading more information
  </span>
</template>

<script>
  import Vue from 'vue';
  export default class LoadingAlert extends Vue {}
</script>

<style scoped>
  span::after {
    animation: ellipsis-dot 1s infinite .3s;
    animation-fill-mode: fowards;
    content: "...";
    display: inline-block;
    overflow: hidden;
    vertical-align: bottom;
    width: 1.25em;
  }

  @keyframes ellipsis-dot {
    25% {
      content: "";
    }
    50% {
      content: ".";
    }
    75% {
      content: "..";
    }
    100% {
      content: "...";
    }
  }
</style>
