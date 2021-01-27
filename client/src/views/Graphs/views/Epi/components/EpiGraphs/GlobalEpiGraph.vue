<template>
    <div class="global-epi-graph-container" ref="graph">
    </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

  import { GraphInterface } from '@/views/Graphs/types/types';

  import GlobalEpiModelRenderer from '@/graphs/svg/GlobalEpiModelRenderer';
  import ELKAdapter from '@/graphs/svg/elk/adapter.js';
  import { layered } from '@/graphs/svg//elk/layouts.js';
  import { hierarchyFn, showTooltip, hideTooltip } from '@/utils/SVGUtil.js';
  import { calculateNeighborhood, formatHierarchyNodeData } from '@/graphs/svg/util.js';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 40,
    layout: layered,
  };

  @Component
  export default class GlobalEpiGraph extends Vue {
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
      this.renderer = new GlobalEpiModelRenderer({
        el: this.$refs.graph,
        adapter: new ELKAdapter(DEFAULT_RENDERING_OPTIONS),
        renderMode: 'delta',
      });

      this.renderer.setCallback('nodeClick', (node) => {
        // Clear previous highlights
        this.renderer.hideNeighbourhood();
        // Show neighborhood
        const neighborhood = calculateNeighborhood(this.graph, node.datum());
        this.renderer.showNeighborhood(neighborhood);
        // this.$emit('node-click', node.datum().data);
      });

     // Collapse/Expand
     this.renderer.setCallback('nodeDblClick', (node) => {
        if (!node.datum().collapsed || node.datum().collapsed === false) {
          this.renderer.collapse(node.datum().id);
        } else {
          this.renderer.expand(node.datum().id);
        }
      });

      this.renderer.setCallback('backgroundDblClick', () => {
        this.renderer.hideNeighbourhood();
        this.$emit('background-dbl-click');
      });

      this.renderer.setCallback('nodeMouseEnter', (node) => {
        const nodeData = node.datum();
        const nodeCoords = [nodeData.x, nodeData.y]; // TO FIX: It seems there is an issue with coordinates for deeply nested nodes.

        const tooltipText = 'Name: ' + nodeData.label + ' ' + 'Type: ' + nodeData.data.nodeType;

        showTooltip(this.renderer.chart, tooltipText, nodeCoords);
      });

      this.renderer.setCallback('nodeMouseLeave', () => {
        hideTooltip(this.renderer.chart);
      });

      this.refresh();
    }

    refresh (): void {
      const hierarchyNodes = hierarchyFn(this.graph.nodes); // Transform the flat nodes structure into a hierarchical one
      formatHierarchyNodeData(hierarchyNodes);

      const edges = this.graph.edges;
      const graph = { nodes: [hierarchyNodes], edges };

      this.renderer.setData(graph);
      this.renderer.render();
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.global-epi-graph-container {
  flex: 1;

  ::v-deep > svg {
    width: 100%;
    height: 100%;
  }
}

</style>
