<template>
  <ul class="legend-simulation">
    <li class="run current">Current Run</li>
    <li class="run previous">Previous Runs</li>
    <li class="run aggregate">Aggregate of all Runs</li>
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

  .run::before {
    content: "\0A";
    display: inline-block;
    height: .5em;
    margin-right: 1em;
    width: 3em;
  }

  .aggregate::before {
    background-color: var(--selection);
  }

  .current::before {
    background-color: var(--colours-nodes-default);

    /* To help separate from the panel background */
    border: 1px solid var(--nord4);
  }

  .previous::before {
    background-color: var(--colours-nodes-other);
  }
</style>
