<template>
    <div class="global-graph-container" ref="graph">
    </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

  import { expandCollapse, highlight } from 'svg-flowgraph';

  import { GraphInterface, SubgraphInterface, GraphLayoutInterfaceType } from '@/types/typesGraphs';

  import EpiRenderer from '@/graphs/svg/renderers/EpiRenderer';
  import DagreAdapter from '@/graphs/svg/dagre/adapter';
  import ELKAdapter from '@/graphs/svg/elk/adapter';
  import { showTooltip, hideTooltip, hierarchyFn } from '@/utils/SVGUtil.js';
  import { calculateNodeNeighborhood, constructRootNode } from '@/graphs/svg/util.js';
  import { Colors } from '@/graphs/svg/encodings';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 40,
    parameterNodeSize: 30,
  };

  @Component
  export default class GlobalGraph extends Vue {
    @Prop({ default: null }) data: GraphInterface;
    @Prop({ default: null }) subgraph: SubgraphInterface;
    @Prop({ default: GraphLayoutInterfaceType.elk }) layout: string;

    renderingOptions = DEFAULT_RENDERING_OPTIONS;
    renderer = null;
    selectedNode = '';

    @Watch('data')
    dataChanged (): void {
      this.refresh();
    }

    @Watch('subgraph')
    onSubgraphChange (): void {
      this.subgraphChanged();
    }

    @Watch('layout')
    async layoutChanged (): Promise<void> {
      await this.refresh();
      this.subgraphChanged();
    }

    subgraphChanged (): void {
      if (this.subgraph) {
        this.renderer.showSubgraph(this.subgraph);
      } else {
        this.renderer.hideSubgraph();
      }
    }

    mounted (): void {
       this.renderer = new EpiRenderer({
        el: this.$refs.graph,
        adapter: new ELKAdapter(DEFAULT_RENDERING_OPTIONS),
        renderMode: 'basic',
        useEdgeControl: false,
        useZoom: true,
        useMinimap: false,
        addons: [expandCollapse, highlight],
      });

      this.renderer.setCallback('nodeClick', (evt, node) => {
        const id = node.datum().id;
        this.selectedNode = id;
        if (node.datum().nodes) {
          if (node.datum().collapsed === true) {
            this.renderer.expand(id);
          } else {
            this.renderer.collapse(id);
          }
        } else {
          const neighborhood = calculateNodeNeighborhood(this.data, node.datum());
          this.renderer.highlight(neighborhood, { color: Colors.HIGHLIGHT, duration: 5000 });
          
          this.renderer.clearSelections();
          this.renderer.selectNode(node);
          this.$emit('node-click', node.datum().data);
        }
      });

      this.renderer.setCallback('nodeMouseEnter', (evt, node, renderer) => {
        if (!node.datum().nodes) {
          const data = node.datum();
          /* @ts-ignore */
          showTooltip(renderer.chart, data.label, [data.x + data.width / 2, data.y]); // Fixme: tooltips for nodes within a container are not properly placed
        }
      });

      this.renderer.setCallback('nodeMouseLeave', (evt, node, renderer) => {
        if (node.datum().nodes) return;
        hideTooltip(renderer.chart);
      });

      this.renderer.setCallback('backgroundClick', () => {
        this.selectedNode = '';
        this.renderer.clearSelections();
        this.$emit('background-click');
      });

      this.refresh();
    }

    refresh (): Promise<void> {
      if (!this.data) return;

      // Layout selection
      if (this.layout === GraphLayoutInterfaceType.elk) {
        this.renderer.adapter = new ELKAdapter(DEFAULT_RENDERING_OPTIONS);
      } else {
        this.renderer.adapter = new DagreAdapter(DEFAULT_RENDERING_OPTIONS);
      }

      const nodesHierarchy = hierarchyFn(this.data?.nodes); // Transform the flat nodes structure into a hierarchical one
      constructRootNode(nodesHierarchy); // Parse the data to a format that the graph renderer understands
      const data = { nodes: [nodesHierarchy], edges: this.data?.edges };

      this.renderer.setData(data);
      return this.renderer.render();
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.global-graph-container {
  flex: 1;
  background-color: $bg-graphs;
  ::v-deep > svg {
    width: 100%;
    height: 100%;
  }
}

</style>
