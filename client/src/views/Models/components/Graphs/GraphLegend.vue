<template>
  <aside class="graph-legend">
    <header>Legend</header>
    <ul>
      <li>Container</li>
      <li>Parameter</li>
      <li>Initial Condition</li>
      <li>Variable</li>
      <li>Other</li>
    </ul>
    <span>Sensitivity score (0&ndash;1)</span>
  </aside>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';

  @Component
  export default class GraphLegend extends Vue {
  }
</script>

<style scoped>
  .graph-legend {
    bottom: 1rem;
    left: 1rem;
    position: absolute;
  }
</style>
