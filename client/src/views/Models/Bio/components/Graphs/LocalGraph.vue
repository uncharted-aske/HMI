<template>
    <div class="local-graph-container" ref="graph" />
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

  import { GraphInterface } from '@/types/typesGraphs';

  import BioLocalRenderer from '@/graphs/svg/renderers/BioLocalRenderer';
  import Adapter from '@/graphs/svg/elk/adapter';
  import { layered } from '@/graphs/svg/elk/layouts';

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
        useZoom: true,
        useMinimap: false,
        addons: [],
      });

    //   this.renderer.setCallback('nodeClick', (node) => {
    //     // Clear previous highlights
    //     this.renderer.hideNeighbourhood();
    //     // Show neighborhood
    //     const neighborhood = calculateNodeNeighborhood(this.graph, node.datum());
    //     this.renderer.showNeighborhood(neighborhood);
    //     this.$emit('node-click', node.datum());
    //   });

    //   this.renderer.setCallback('edgeClick', (edge) => {
    //     // Clear previous highlights
    //     this.renderer.hideNeighbourhood();
    //     // Show neighborhood
    //     const neighborhood = calculateEdgeNeighborhood(edge.datum());
    //     this.renderer.showNeighborhood(neighborhood);
    //     // Hack: get labels for source and target
    //     const sourceNode = this.renderer.data.nodes.find(node => node.id === edge.datum().source);
    //     const targetNode = this.renderer.data.nodes.find(node => node.id === edge.datum().target);

    //     edge.datum().data.metadata.sourceLabel = sourceNode.label;
    //     edge.datum().data.metadata.targetLabel = targetNode.label;
    //     this.$emit('edge-click', edge.datum().data);
    //   });

    //   this.renderer.setCallback('backgroundDblClick', () => {
    //     this.renderer.hideNeighbourhood();
    //     this.$emit('background-dbl-click');
    //   });

    //   this.renderer.setCallback('nodeMouseEnter', (node) => {
    //     const nodeData = node.datum();
    //     const nodeCoords = [nodeData.x + (nodeData.width * 0.5), nodeData.y + (nodeData.height * 0.5)]; // TO FIX: It seems there is an issue with coordinates for deeply nested nodes.

    //     const tooltipText = 'Name: ' + nodeData.label + ' ' + 'Type: ' + nodeData.nodeType;

    //     showTooltip(this.renderer.chart, tooltipText, nodeCoords);
    //   });

    //   this.renderer.setCallback('nodeMouseLeave', () => {
    //     hideTooltip(this.renderer.chart);
    //   });

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

.local-graph-container {
  flex: 1;
  background-color: $bg-graphs;

  ::v-deep > svg {
    width: 100%;
    height: 100%;
  }
}

</style>
