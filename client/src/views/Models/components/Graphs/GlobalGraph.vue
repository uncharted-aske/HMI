<template>
  <div class="global-graph-container" ref="graph" />
</template>

<script lang="ts">
  import _ from 'lodash';

  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';

  import { expandCollapse, highlight } from 'svg-flowgraph';

  import { GraphInterface, SubgraphInterface, SubgraphNodeInterface, GraphLayoutInterfaceType } from '@/types/typesGraphs';

  import EpiRenderer from '@/graphs/svg/renderers/EpiRenderer';
  import DagreAdapter from '@/graphs/svg/dagre/adapter';
  import ELKAdapter from '@/graphs/svg/elk/adapter';
  import { /** showTooltip, hideTooltip */ hierarchyFn } from '@/utils/SVGUtil.js'; // TODO: Put tooltips back when we fix the positioning issue
  import { calculateNodeNeighborhood, constructRootNode, calcNodesToCollapse } from '@/graphs/svg/util.js';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 40,
    parameterNodeSize: 30,
  };

  @Component
  export default class GlobalGraph extends Vue {
    @Prop({ default: null }) data: GraphInterface;
    @Prop({ default: null }) subgraph: SubgraphInterface;
    @Prop({ default: null }) highlight: SubgraphInterface;
    @Prop({ default: () => [] }) displayedNodes: SubgraphNodeInterface[];
    @Prop({ default: null }) overlappingElements: SubgraphInterface;
    @Prop({ default: GraphLayoutInterfaceType.elk }) layout: string;

    renderingOptions = DEFAULT_RENDERING_OPTIONS;
    renderer = null;

    @Watch('data')
    dataChanged (): void {
      this.refresh();
    }

    @Watch('subgraph')
    onSubgraphChange (): void {
      this.dataDecorationChanged();
    }

    @Watch('highlight')
    onHighlightChange (): void {
      this.dataDecorationChanged();
    }

    @Watch('layout')
    async layoutChanged (): Promise<void> {
      await this.refresh();
      this.dataDecorationChanged();
    }

    @Watch('displayedNodes')
    displayedNodesChanged (): void {
      this.dataDecorationChanged();
    }

    @Watch('overlappingElements')
    overlappingElementsChanged ():void {
      this.dataDecorationChanged();
    }

    dataDecorationChanged (): void {
      this.renderer.clearSelections();

      if (this.subgraph) {
        this.renderer.showSubgraph(this.subgraph);
      } else {
        this.renderer.hideSubgraph();
      }
      if (this.displayedNodes) {
        this.renderer.markDisplayedNodes(this.displayedNodes);
      }
      if (this.overlappingElements) {
        this.renderer.markOverlappingElements(this.overlappingElements);
      }
      if (this.highlight) {
        this.renderer.showHighlight(this.highlight);
      }
    }

    mounted (): void {
      this.renderer = new EpiRenderer({
        el: this.$refs.graph,
        adapter: new ELKAdapter(DEFAULT_RENDERING_OPTIONS),
        renderMode: 'basic',
        useEdgeControl: false,
        useZoom: true,
        useStableZoomPan: true,
        useMinimap: false,
        addons: [expandCollapse, highlight],
      });

      this.renderer.setCallback('nodeDblClick', (evt, node) => {
        this.renderer.hideSubgraph();

        if (node.datum().nodes) {
          const id = node.datum().id;
          if (node.datum().collapsed === true) {
            this.renderer.expand(id);
          } else {
            this.renderer.collapse(id);
          }
          this.renderer.render();
        }

        this.$emit('node-dblclick', node.datum().data);
      });

      this.renderer.setCallback('nodeClick', (evt, node) => {
        this.renderer.hideSubgraph();
        this.renderer.clearSelections();

        // Only show neighborhood for children nodes
        if (!node.datum().nodes) {
          const neighborhood = calculateNodeNeighborhood(this.data, node.datum());
          this.renderer.showSubgraph(neighborhood);
          if (this.overlappingElements) {
            this.renderer.markOverlappingElements(this.overlappingElements);
          }
        }
        this.renderer.selectNode(node);

        this.$emit('node-click', node.datum().data);
      });

      this.renderer.setCallback('backgroundClick', () => {
        this.renderer.hideSubgraph();
        this.renderer.clearSelections();
        if (this.overlappingElements) {
          this.renderer.markOverlappingElements(this.overlappingElements);
        }
        this.$emit('background-click');
      });

      this.refresh();
    }

    async refresh (): Promise<void> {
      if (!this.data) return;
      let data = _.cloneDeep(this.data);

      // Layout selection
      if (this.layout === GraphLayoutInterfaceType.elk) {
        this.renderer.adapter = new ELKAdapter(DEFAULT_RENDERING_OPTIONS);
      } else {
        this.renderer.adapter = new DagreAdapter(DEFAULT_RENDERING_OPTIONS);
      }

      // Transform the flat nodes structure into a hierarchical one
      const nodesHierarchy = hierarchyFn(data.nodes);
      constructRootNode(nodesHierarchy); // Parse the data to a format that the graph renderer understands
      data = { nodes: [nodesHierarchy], edges: data.edges };

      this.renderer.setData(data);
      await this.renderer.render();

      // Collapse top-level boxes by default
      // HACK: The collapse/expand functions are asynchronous and trying to execute them all at once
      // seems to create problems with the tracker.
      const collapsedIds = calcNodesToCollapse(this.layout, this.renderer.layout);
      if (collapsedIds.length > 0) {
        collapsedIds.forEach(nextId => this.renderer.collapse(nextId));
        await this.renderer.render();
        this.renderer.centerGraph();
      }

      this.dataDecorationChanged();
    }
  }
</script>

<style scoped>
.global-graph-container {
  background-color: var(--bg-graphs);
  flex: 1;
  overflow: hidden;
}

.global-graph-container::v-deep > svg {
  height: 100%;
  width: 100%;
}

</style>
