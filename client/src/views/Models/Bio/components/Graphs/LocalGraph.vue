<template>
  <div class="local-graph-container" ref="graph" />
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

  import { highlight } from 'svg-flowgraph';

  import { GraphInterface } from '@/types/typesGraphs';

  import BioLocalRenderer from '@/graphs/svg/renderers/BioLocalRenderer';
  import Adapter from '@/graphs/svg/elk/adapter';
  import { layered } from '@/graphs/svg/elk/layouts';
  import { calculateNodeNeighborhood } from '@/graphs/svg/util.js';
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
        addons: [highlight],
      });

      this.renderer.setCallback('nodeClick', (evt, node) => {
        const neighborhood = calculateNodeNeighborhood(this.data, node.datum());
        this.renderer.highlight(neighborhood, { color: Colors.HIGHLIGHT, duration: 5000 });
        this.$emit('node-click', node.datum());
      });

      this.renderer.setCallback('nodeMouseEnter', (evt, node, renderer) => {
        const data = node.datum();
        showTooltip(renderer.chart, data.label, [data.x + data.width / 2, data.y]);
      });

      this.renderer.setCallback('nodeMouseLeave', (evt, node, renderer) => {
        hideTooltip(renderer.chart);
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
