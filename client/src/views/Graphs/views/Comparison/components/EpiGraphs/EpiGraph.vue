<template>
    <div class="epi-graph-container" ref="graph">
    </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

  import { GraphInterface } from '@/views/Graphs/types/types';
  import { SubgraphInterface } from '@/graphs/svg/types/types';

  import GlobalEpiModelRenderer from '@/graphs/svg/GlobalEpiModelRenderer';
  import ELKAdapter from '@/graphs/svg/elk/adapter.js';
  import { layered } from '@/graphs/svg//elk/layouts.js';
  import { hierarchyFn } from '@/utils/SVGUtil.js';
  import { calculateNeighborhood, formatHierarchyNodeData } from '@/graphs/svg/util.js';

  import { Colors } from '@/graphs/svg/encodings';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 40,
    layout: layered,
  };

  @Component
  export default class EpiGraph extends Vue {
    @Prop({ default: null }) graph: GraphInterface;
    @Prop({ default: null }) subgraph: SubgraphInterface;
    @Prop({ default: '' }) reference: string;

    renderingOptions = DEFAULT_RENDERING_OPTIONS;
    renderer = null;

    @Watch('graph')
    graphChanged (): void {
      this.refresh();
    }

    @Watch('reference')
    referenceChanged (): void {
      this.renderer.highlightReference(this.reference, Colors.HIGHLIGHT);
      this.renderer.moveTo(this.reference, 3000);
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
        this.$emit('node-click', node.datum().data); // TO FIX
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

      // TO FIX: Enable back tooltip functionality
      this.renderer.setCallback('nodeMouseEnter', (node) => {
        const nodeData = node.datum();
        // Highlight linked nodes/edges
        if (!nodeData.nodes) {
          const found = this.subgraph.nodes.find(node => node.id === nodeData.id);
          if (found) {
            this.$emit('node-hover', found);
          }
        }
      });

      this.renderer.setCallback('nodeMouseLeave', () => {
        this.renderer.unHighlightReference(this.reference);
      });

      this.refresh();
    }

    async refresh (): Promise<void> {
      const hierarchyNodes = hierarchyFn(this.graph.nodes); // Transform the flat nodes structure into a hierarchical one
      formatHierarchyNodeData(hierarchyNodes); // Refines this hierarchical structure to a format that can be used by the renderer
      const edges = this.graph.edges;
      const graph = { nodes: [hierarchyNodes], edges };
      this.renderer.setData(graph);
      await this.renderer.render();
      if (this.subgraph) {
        this.renderer.showNeighborhood(this.subgraph);
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.epi-graph-container {
  background-color: $bg-graphs;
  flex: 1;

  ::v-deep > svg {
    width: 100%;
    height: 100%;
  }
}

</style>
