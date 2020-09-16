<template>
  <div class="container">
    <div>This is a JS component!</div>
    <div>Random number from JS: {{randomNumber}}</div>
  </div>
</template>

<script>
  export default {
    name: 'JSComponent',
    data: () => ({
      randomNumber: Math.random(),
    }),
  };
</script>

<style scoped>
  .container {
    border: black 1px solid;
    background-color: greenyellow;
    margin: 10px;
  }
</style>
