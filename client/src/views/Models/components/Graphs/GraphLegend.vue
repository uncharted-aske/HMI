<template>
  <aside
    class="graph-legend"
    :class="{ 'open' : isOpen }"
    :style="{
      '--colour-nodes-container': COLOURS.NODES.CONTAINER,
      '--colour-nodes-default': COLOURS.NODES.DEFAULT,
      '--colour-labels-dark': COLOURS.LABELS.DARK,
      '--stroke': DEFAULT_STYLE.node.stroke,
      '--stroke-width': DEFAULT_STYLE.node.strokeWidth,
    }"
  >
    <header>
      Legend
      <button type="button" @click="toggleLegend()">
        <font-awesome-icon :icon="['fas', toggleIcon ]" />
      </button>
    </header>
    <div class="legend">
      <ul>
        <li class="legend-container">
          <svg viewBox="-5 -5 130 50">
            <rect x="35" y="0" :rx="DEFAULT_STYLE.node.borderRadius" width="40" height="40"></rect>
          </svg>
          Container
        </li>
        <li class="legend-parameter">
          <svg viewBox="-5 -5 130 50">
            <rect x="40" y="5" :rx="DEFAULT_STYLE.node.borderRadius" width="30" height="30"></rect>
          </svg>
          Parameter
        </li>
        <li class="legend-initial-condition">
          <svg viewBox="-5 -5 130 50">
            <ellipse cx="60" cy="20" rx="60" ry="20"></ellipse>
            <text x="60" y="25">Node IC</text>
          </svg>
          Initial Condition
        </li>
        <li class="legend-variable">
          <svg viewBox="-5 -5 130 50">
            <rect x="0" y="0" :rx="DEFAULT_STYLE.node.borderRadius" width="120" height="40"></rect>
            <text x="60" y="25">Node V</text>
          </svg>
          Variable
        </li>
        <li class="legend-other">
          <svg viewBox="-5 -5 130 50">
            <rect x="0" y="0" :rx="DEFAULT_STYLE.node.borderRadius" width="120" height="40"></rect>
            <text x="60" y="25">Node O</text>
          </svg>
          Other
        </li>
      </ul>
    </div>
  </aside>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import { Colors } from '@/graphs/svg/encodings';
  import { DEFAULT_STYLE } from '@/graphs/svg/renderers/EpiRenderer';

  @Component
  export default class GraphLegend extends Vue {
    @Prop({ default: false }) open: boolean;
    isOpen: boolean = false;
    COLOURS = Colors;
    DEFAULT_STYLE = DEFAULT_STYLE;

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

  .legend ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .legend li:not(:first-of-type) {
    margin-top: .5em;
  }

  /* isOpen */
  .graph-legend.open .legend {
    max-height: 100vh;
    padding: 1em;
  }
</style>
<style>
  /* For SVG you cannot scope the <style> */
  .graph-legend .legend svg {
    display: inline-block;
    margin-right: 1em;
    width: 8em;
  }

  .graph-legend .legend rect,
  .graph-legend .legend ellipse {
    stroke: var(--stroke);
    stroke-width: var(--stroke-width);
  }

  .graph-legend .legend li:not(.legend-container) rect,
  .graph-legend .legend ellipse {
    fill: var(--colour-nodes-default);
  }

  .graph-legend .legend-container rect {
    fill: var(--colour-nodes-container);
  }

  .graph-legend .legend-other rect {
    stroke-dasharray: 5,5;
  }

  .graph-legend .legend text {
    fill: var(--colour-labels-dark);
    font-weight: normal;
    text-anchor: middle;
  }
</style>
