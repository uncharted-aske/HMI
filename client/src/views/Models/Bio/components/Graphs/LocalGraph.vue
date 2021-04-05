<template>
  <div class="local-graph-container" ref="graph" />
</template>

<script lang="ts">
  import * as d3 from 'd3';
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

  import { GraphInterface } from '@/types/typesGraphs';

  import BioLocalRenderer from '@/graphs/svg/renderers/BioLocalRenderer';
  import Adapter from '@/graphs/svg/elk/adapter';
  import { layered } from '@/graphs/svg/elk/layouts';
  import { calculateNodeNeighborhood, calculateEdgeNeighborhood } from '@/graphs/svg/util.js';
  import { showTooltip, hideTooltip } from '@/utils/SVGUtil.js';
  import { Colors } from '@/graphs/svg/encodings';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 40,
    layout: layered,
  };

  @Component
  export default class LocalGraph extends Vue {
    @Prop({ default: null }) data: GraphInterface;

    renderingOptions = DEFAULT_RENDERING_OPTIONS;
    renderer = null;

    @Watch('data')
    dataChanged (): void {
      this.refresh();
    }

    mounted (): void {
      this.renderer = new BioLocalRenderer({
        el: this.$refs.graph,
        adapter: new Adapter(DEFAULT_RENDERING_OPTIONS),
        renderMode: 'basic',
        useEdgeControl: true,
        edgeControlOffset: 0.5,
        useZoom: true,
        useMinimap: false,
        addons: [],
      });

      // Node interactions
      this.renderer.setCallback('nodeClick', (evt, node) => {
        const neighborhood = calculateNodeNeighborhood(this.data, node.datum());
        this.renderer.hideNeighborhood();
        this.renderer.showNeighborhood(neighborhood);
        this.$emit('node-click', node.datum());
      });

      this.renderer.setCallback('nodeMouseEnter', (evt, node, renderer) => {
        const nodeData = node.datum();
        showTooltip(renderer.chart, nodeData.label, [nodeData.x + nodeData.width / 2, nodeData.y], null, null);
      });

      this.renderer.setCallback('nodeMouseLeave', (evt, node, renderer) => {
        hideTooltip(renderer.chart);
      });

      // Edge interactions
      this.renderer.setCallback('edgeClick', (evt, edge) => {
        const neighborhood = calculateEdgeNeighborhood(edge.datum());
        this.renderer.hideNeighborhood();
        this.renderer.showNeighborhood(neighborhood);
        // this.$emit('edge-click', edge.datum());
      });

      this.renderer.setCallback('edgeMouseEnter', (evt, edge, renderer) => {
        const edgeData = edge.datum();
        const label = ' Statement type:' + edgeData.data.edgeType + ' Curated state:' + edgeData.data.curated;

        // Get edge control's coordinates to place the tooltip
        const transform = edge.select('.edge-control').attr('transform');
        const splitted = transform.split(',');
        const x = splitted[0].split('(')[1];
        const y = splitted[1].split(')')[0];
        showTooltip(renderer.chart, label, [x, y], null, null);
      });

      this.renderer.setCallback('edgeMouseLeave', (evt, edge, renderer) => {
        hideTooltip(renderer.chart);
      });

      this.renderer.setCallback('backgroundClick', () => {
        this.renderer.hideNeighborhood();
      });

      this.refresh();
    }

    async refresh (): Promise<void> {
      this.renderer.setData(this.data);
      await this.renderer.render();
      this.$emit('loaded');
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.local-graph-container {
  flex: 1;
  background-color: $bg-graphs;

  ::v-deep > svg {
    width: 100%;
    height: 100%;
  }
}

</style>
