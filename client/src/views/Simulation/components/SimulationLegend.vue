<template>
  <ul class="legend-simulation">
    <li class="run current">Current Run</li>
    <li class="run previous">Previous Runs</li>
    <li class="run average">Average of all Runs</li>
    <li class="observational">Observational Data</li>
  </ul>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';

  @Component
  export default class SimulationLegend extends Vue {}
</script>

<style scoped>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li:not(:first-of-type) {
    margin-top: .5em;
  }

  li::before {
    content: "\0A";
    display: inline-block;
    height: .5em;
    margin-right: 1em;
    width: 3em;
  }

  .run.average::before {
    background-color: var(--selection);
  }

  .run.current::before {
    background-color: var(--colours-nodes-default);

    /* To help separate from the panel background */
    border: 1px solid var(--nord4);
  }

  .run.previous::before {
    background-color: var(--colours-nodes-other);
  }

  .observational::before {
    background-color: var(--colours-observational);
  }
</style>
