<template>
    <div class="local-epi-graph-container" ref="graph">
    </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

  import { GraphInterface } from '@/views/Graphs/types/types';

  import LocalEpiModelRenderer from '@/graphs/svg/LocalEpiModelRenderer';
  import ELKAdapter from '@/graphs/svg/elk/adapter.js';
  import { layered } from '@/graphs/svg//elk/layouts.js';
  import { showTooltip, hideTooltip } from '@/utils/SVGUtil.js';
  import { calculateNodeNeighborhood, calculateEdgeNeighborhood } from '@/graphs/svg/util.js';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 40,
    layout: layered,
  };

  @Component
  export default class LocalBioGraph extends Vue {
    @Prop({ default: null }) graph: GraphInterface;

    renderingOptions = DEFAULT_RENDERING_OPTIONS;
    renderer = null;

    @Watch('graph')
    graphChanged (): void {
      this.refresh();
    }

    created (): void {
      this.renderer = null;
    }

    mounted (): void {
      this.renderer = new LocalEpiModelRenderer({
        el: this.$refs.graph,
        adapter: new ELKAdapter(DEFAULT_RENDERING_OPTIONS),
        renderMode: 'basic',
      });

      this.renderer.setCallback('nodeClick', (node) => {
        // Clear previous highlights
        this.renderer.hideNeighbourhood();
        // Show neighborhood
        const neighborhood = calculateNodeNeighborhood(this.graph, node.datum());
        this.renderer.showNeighborhood(neighborhood);
        this.$emit('node-click', node.datum());
      });

      this.renderer.setCallback('edgeClick', (edge) => {
        // Clear previous highlights
        this.renderer.hideNeighbourhood();
        // Show neighborhood
        const neighborhood = calculateEdgeNeighborhood(edge.datum());
        this.renderer.showNeighborhood(neighborhood);
        this.$emit('edge-click', edge.datum().data);
      });

      this.renderer.setCallback('backgroundDblClick', () => {
        this.renderer.hideNeighbourhood();
        this.$emit('background-dbl-click');
      });

      this.renderer.setCallback('nodeMouseEnter', (node) => {
        const nodeData = node.datum();
        const nodeCoords = [nodeData.x + (nodeData.width * 0.5), nodeData.y + (nodeData.height * 0.5)]; // TO FIX: It seems there is an issue with coordinates for deeply nested nodes.

        const tooltipText = 'Name: ' + nodeData.label + ' ' + 'Type: ' + nodeData.nodeType;

        showTooltip(this.renderer.chart, tooltipText, nodeCoords);
      });

      this.renderer.setCallback('nodeMouseLeave', () => {
        hideTooltip(this.renderer.chart);
      });

      this.refresh();
    }

    refresh (): void {
      this.renderer.setData(this.graph);
      this.renderer.render();
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.local-epi-graph-container {
  flex: 1;
  background-color: $bg-graphs;

  ::v-deep > svg {
    width: 100%;
    height: 100%;
  }
}

</style>
