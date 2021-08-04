<template>
  <aside class="graph-legend" :class="{ 'open' : isOpen }">
    <header>
      Legend
      <button type="button" @click="toggleLegend()">
        <font-awesome-icon :icon="['fas', toggleIcon ]" />
      </button>
    </header>
    <div class="legend">
      <ul>
        <li>Container</li>
        <li>Parameter</li>
        <li>Initial Condition</li>
        <li>Variable</li>
        <li>Other</li>
      </ul>
      <span>Sensitivity score (0&ndash;1)</span>
    </div>
  </aside>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  @Component
  export default class GraphLegend extends Vue {
    @Prop({ default: false }) open: boolean;
    isOpen: boolean = false;

    mounted (): void {
      this.isOpen = Boolean(this.open);
    }

    get toggleIcon (): string {
      return this.isOpen ? 'angle-double-down' : 'angle-double-up';
    }

    toggleLegend (): void {
      this.isOpen = !this.isOpen;
    }
  }
</script>

<style scoped>
  .graph-legend {
    --background-colour: white;
    background-color: var(--background-colour);
    border: var(--border);
    border-radius: 5px 5px 0 0;
    bottom: 0;
    left: 1rem;
    position: absolute;
  }

  header {
    font-size: .85em;
    font-weight: bold;
    line-height: 1rem;
    padding: .33em 0;
    text-align: center;
    text-transform: uppercase;
  }

  header button {
    background-color: var(--background-colour);
    border: none;
    outline: none;
  }

  .legend {
    max-height: 0;
    padding: 0;
    transition: all 500ms ease-in-out;
    will-change: max-height, padding;
  }

  /* isOpen */
  .graph-legend.open .legend {
    max-height: 100vh;
    padding: 1em;
  }
</style>
