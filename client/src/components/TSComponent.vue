<template>
  <div class="container">
    <div>This is a TS component!</div>
    <div>Random number from TS: {{randomNumber}}</div>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'TSComponent',
    data: (): any => ({
      randomNumber: Math.random(),
    }),
  };
</script>

<style scoped>
  .container {
    border: black 1px solid;
    background-color: pink;
    margin: 10px;
  }
</style>
