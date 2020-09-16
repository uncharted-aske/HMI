<template>
  <div class="container">
    <div>This is a TS component from a class!</div>
    <div>Random number from TS: {{randomNumber}}</div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';

  @Component
  export default class TSClassComponent extends Vue {
    public randomNumber: number = Math.random();
  }
</script>

<style scoped>
  .container {
    border: black 1px solid;
    background-color: lightblue;
    margin: 10px;
  }
</style>
