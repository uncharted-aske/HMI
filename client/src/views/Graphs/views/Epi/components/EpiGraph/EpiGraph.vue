<template>
    <div class="epi-graph-container" ref="graph">
    </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

  import { GraphInterface } from '../../../../types/types';

  import EpiModelRenderer from '../../../../../../graphs/svg/EpiModelRenderer.js';
  import ELKAdapter from '../../../../../../graphs/svg/elk/adapter.js';
  import { layered } from '../../../../../../graphs/svg//elk/layouts.js';
  import { hierarchyFn } from '../../../../../../utils/SVGUtil.js';
  import { calculateNeighborhood, formatHierarchyNodeData } from '../../../../../../graphs/svg/util.js';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 40,
    layout: layered,
  };

  @Component
  export default class EpiGraph extends Vue {
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
      this.renderer = new EpiModelRenderer({
        el: this.$refs.graph,
        adapter: new ELKAdapter(DEFAULT_RENDERING_OPTIONS),
        renderMode: 'delta',
      });

      this.renderer.setCallback('nodeClick', (node) => {
        // this.$emit('node-click', node.datum().data); // TO FIX
        const neighborhood = calculateNeighborhood(this.graph, node.datum().id);
        this.renderer.showNeighborhood(neighborhood);
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
      });

      // TO FIX:
      // this.renderer.setCallback('nodeMouseEnter', (node) => {
      //   const nodeData = node.datum();
      //   let nodeCoords = [];
      //   const tooltipText = 'Name: ' + nodeData.label + ' ' + 'Type: ' + nodeData.data.nodeType;
      //   // if (!nodeData.nodes) {
      //   //   // console.log(nodeData);
      //   //   nodeCoords = [nodeData.x, nodeData.y];
      //   //   console.log(nodeCoords);
      //   // }
      //   // else {
      //     // // For nodes inside groups
      //     // const groups = this.renderer.layout.groups;
      //     // const group = groups.find(g => g.id === nodeData.group);
      //     // nodeCoords = [group.x + nodeData.x, group.y + nodeData.y];
      //   //}
      //   showTooltip(this.renderer.chart, tooltipText, nodeCoords);
      // });

      // this.renderer.setCallback('nodeMouseLeave', () => {
      //   hideTooltip(this.renderer.chart);
      // });

      this.refresh();
    }

    refresh (): void {
      const hierarchyNodes = hierarchyFn(this.graph.nodes); // Transform the flat nodes structure into a hierarchical one
      formatHierarchyNodeData(hierarchyNodes); // Refines this hierarchical structure to a format that can be used by the renderer
      const edges = this.graph.edges;
      const graph = { nodes: [hierarchyNodes], edges };
      this.renderer.setData(graph);
      this.renderer.render();
    }
  }
</script>

<style lang="scss" scoped>
@import "../../../../../../styles/variables";

.epi-graph-container {
  height: calc(#{$content-full-height} - #{$secondary-bar-width} - 25px);
  width: 100%;
}

</style>
