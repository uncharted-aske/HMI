<template>
  <aside
    class="graph-legend"
    :class="{ 'open' : isOpen }"
    :style="{
      '--colour-nodes-container': COLOURS.NODES.CONTAINER,
      '--colour-nodes-default': COLOURS.NODES.DEFAULT,
      '--colour-labels-dark': COLOURS.LABELS.DARK,
      '--stroke': STYLE.node.stroke,
      '--stroke-width': STYLE.node.strokeWidth,
    }"
  >
    <header>
      <button type="button" @click="toggleLegend()">
        Legend
        <font-awesome-icon :icon="['fas', toggleIcon ]" />
      </button>
    </header>
    <div class="legend">
      <ul>
        <li class="legend-container">
          <svg :viewBox="viewBox">
            <rect
              :x="containerX" y="0"
              :rx="STYLE.node.borderRadius"
              :width="NODE_HEIGHT"
              :height="NODE_HEIGHT"
            ></rect>
          </svg>
          Container
        </li>
        <li class="legend-parameter">
          <svg :viewBox="viewBox">
            <rect
              :x="parameterX"
              :y="parameterY"
              :rx="STYLE.node.borderRadius"
              :width="PARAMETER_SIZE"
              :height="PARAMETER_SIZE"
            ></rect>
          </svg>
          Parameter
        </li>
        <li class="legend-initial-condition">
          <svg :viewBox="viewBox">
            <ellipse
              :cx="NODE_WIDTH * 0.5"
              :cy="NODE_HEIGHT * 0.5"
              :rx="NODE_WIDTH * 0.5"
              :ry="NODE_HEIGHT * 0.5"
            ></ellipse>
            <text :x="textX" :y="textY">Node IC</text>
          </svg>
          Initial Condition
        </li>
        <li class="legend-variable">
          <svg :viewBox="viewBox">
            <rect
              x="0" y="0"
              :rx="STYLE.node.borderRadius"
              :width="NODE_WIDTH"
              :height="NODE_HEIGHT"
            ></rect>
            <text :x="textX" :y="textY">Node V</text>
          </svg>
          Variable
        </li>
        <li class="legend-other">
          <svg :viewBox="viewBox">
            <rect
              x="0" y="0"
              :rx="STYLE.node.borderRadius"
              :width="NODE_WIDTH"
              :height="NODE_HEIGHT"
            ></rect>
            <text :x="textX" :y="textY">Node O</text>
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
  import {
    DEFAULT_STYLE,
    DEFAULT_RENDERING_OPTIONS,
  } from '@/graphs/svg/renderers/EpiRenderer';

  @Component
  export default class GraphLegend extends Vue {
    @Prop({ default: false }) open: boolean;
    isOpen: boolean = false;
    COLOURS = Colors;
    STYLE = DEFAULT_STYLE;
    NODE_HEIGHT = DEFAULT_RENDERING_OPTIONS.nodeHeight;
    NODE_WIDTH = DEFAULT_RENDERING_OPTIONS.nodeWidth;
    PADDING = DEFAULT_RENDERING_OPTIONS.padding;
    PARAMETER_SIZE = DEFAULT_RENDERING_OPTIONS.parameterNodeSize;

    mounted (): void {
      this.isOpen = Boolean(this.open);
    }

    get viewBox (): string {
      return [
        `-${this.PADDING}`,
        `-${this.PADDING}`,
        `${this.NODE_WIDTH + this.PADDING * 2}`,
        `${this.NODE_HEIGHT + this.PADDING * 2}`,
      ].join(' ');
    }

    get containerX (): number { return (this.NODE_WIDTH - this.NODE_HEIGHT) * 0.5 + this.PADDING; }

    get parameterX (): number { return (this.NODE_WIDTH - this.PARAMETER_SIZE) * 0.5 + this.PADDING; }
    get parameterY (): number { return (this.NODE_HEIGHT - this.PARAMETER_SIZE) * 0.5; }

    get textX (): number { return this.NODE_WIDTH * 0.5; }
    get textY (): number { return this.NODE_HEIGHT * 0.5 + this.PADDING; }

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
    border-radius: 5px;
    bottom: .5em;
    left: 1em;
    overflow: hidden;
    position: absolute;
  }

  header {
    padding: .33em 0;
    text-align: center;
  }

  header button {
    background-color: var(--background-colour);
    border: none;
    font-size: .85em;
    font-weight: bold;
    line-height: 1rem;
    outline: none;
    text-transform: uppercase;
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
  .legend {
    max-height: 0;
    padding: 0;
    transition: max-height 100ms, padding 50ms;
    will-change: max-height, padding;
  }
  .graph-legend.open .legend {
    max-height: 100vh;
    padding: 1em;
    transition: max-height 250ms, padding 50ms;
  }
</style>
<style>
  /* For SVG you cannot scope the <style> */
  .graph-legend .legend svg {
    display: inline-block;
    margin-right: 1em;
    width: 5em;
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
