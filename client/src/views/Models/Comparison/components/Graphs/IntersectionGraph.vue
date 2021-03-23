<template>
    <div class="intersection-graph-container" ref="graph">
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

  import { highlight } from 'svg-flowgraph';

  import { GraphInterface } from '@/types/typesGraphs';

  import EpiRenderer from '@/graphs/svg/renderers/EpiRenderer';
  import Adapter from '@/graphs/svg/elk/adapter';
  import { layered } from '@/graphs/svg/elk/layouts';
  import { showTooltip, hideTooltip } from '@/utils/SVGUtil.js';
  import { calculateNodeNeighborhood } from '@/graphs/svg/util.js';
  import { Colors } from '@/graphs/svg/encodings';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 40,
    layout: layered,
  };

  @Component
  export default class IntersectionGraph extends Vue {
    @Prop({ default: null }) data: GraphInterface;

    renderingOptions = DEFAULT_RENDERING_OPTIONS;
    renderer = null;

    @Watch('data')
    dataChanged (): void {
      this.refresh();
    }

    mounted (): void {
       this.renderer = new EpiRenderer({
        el: this.$refs.graph,
        adapter: new Adapter(DEFAULT_RENDERING_OPTIONS),
        renderMode: 'delta',
        useEdgeControl: false,
        useZoom: true,
        useMinimap: false,
        addons: [highlight],
      });

      this.renderer.setCallback('nodeClick', (evt, node) => {
        const neighborhood = calculateNodeNeighborhood(this.data, node.datum());
        this.renderer.highlight(neighborhood, { color: Colors.HIGHLIGHT, duration: 5000 });
      });

      this.renderer.setCallback('nodeMouseEnter', (evt, node, renderer) => {
        const data = node.datum();
        showTooltip(renderer.chart, data.label, [data.x + data.width / 2, data.y]);
      });

      this.renderer.setCallback('nodeMouseLeave', (evt, node, renderer) => {
        hideTooltip(renderer.chart);
    });

      // this.renderer.setCallback('nodeClick', (node) => {
      //   // Clear previous highlights
      //   this.renderer.hideNeighbourhood();
      //   // Show neighborhood
      //   const neighborhood = calculateNodeNeighborhood(this.graph, node.datum());
      //   this.renderer.showNeighborhood(neighborhood);
      //   this.$emit('node-click', node.datum());
      // });

      // this.renderer.setCallback('nodeMouseEnter', (node) => {
      //   const nodeData = node.datum();
      //   const nodeCoords = [nodeData.x + (nodeData.width * 0.5), nodeData.y + (nodeData.height * 0.5)]; // TO FIX: It seems there is an issue with coordinates for deeply nested nodes.

      //   const tooltipText = 'Name: ' + nodeData.label + ' ' + 'Type: ' + nodeData.nodeType;

      //   showTooltip(this.renderer.chart, tooltipText, nodeCoords);
      // });

      // this.renderer.setCallback('nodeMouseLeave', () => {
      //   hideTooltip(this.renderer.chart);
      // });

      this.refresh();
    }

    refresh (): void {
      this.renderer.setData(this.data);
      this.renderer.render();
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.intersection-graph-container {
  flex: 1;
  background-color: $bg-graphs;
  ::v-deep > svg {
    width: 100%;
    height: 100%;
  }
}

</style>
