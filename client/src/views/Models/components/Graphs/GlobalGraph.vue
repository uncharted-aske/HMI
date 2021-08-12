<template>
  <section class="global-graph-container" ref="graph" />
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';

  import _ from 'lodash';
  import { expandCollapse, highlight } from 'svg-flowgraph';

  import * as Graph from '@/types/typesGraphs';

  import DagreAdapter from '@/graphs/svg/dagre/adapter';
  import ELKAdapter from '@/graphs/svg/elk/adapter';
  import EpiRenderer from '@/graphs/svg/renderers/EpiRenderer';

  import { /** showTooltip, hideTooltip */ hierarchyFn } from '@/utils/SVGUtil.js'; // TODO: Put tooltips back when we fix the positioning issue
  import { calculateNodeNeighborhood, constructRootNode, calcNodesToCollapse } from '@/graphs/svg/util.js';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeHeight: 40,
    nodeWidth: 120,
    parameterNodeSize: 30,
  };

  @Component
  export default class GlobalGraph extends Vue {
    @Prop({ default: null }) data: Graph.GraphInterface;
    @Prop({ default: null }) subgraph: Graph.SubgraphInterface;
    @Prop({ default: () => [] }) displayedNodes: Graph.SubgraphNodeInterface[];
    @Prop({ default: null }) overlappingElements: Graph.SubgraphInterface;
    @Prop({ default: Graph.GraphLayoutInterfaceType.elk }) layout: string;

    renderingOptions = DEFAULT_RENDERING_OPTIONS;
    renderer = null;

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

    @Watch('displayedNodes')
    async displayedNodesChanged (): Promise<void> {
      this.renderer.markDisplayedNodes(this.displayedNodes);
    }

    @Watch('overlappingElements')
    overlappingElementsChanged ():void {
      this.renderer.markOverlappingElements(this.overlappingElements);
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

        // Only show neighborhood for children nodes
        if (!node.datum().nodes) {
          const neighborhood = calculateNodeNeighborhood(this.data, node.datum());
          this.renderer.showSubgraph(neighborhood);
          this.renderer.clearSelections();
          if (this.overlappingElements) {
            this.renderer.markOverlappingElements(this.overlappingElements);
          }
          this.renderer.selectNode(node);
        }

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
      if (this.layout === Graph.GraphLayoutInterfaceType.elk) {
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
      if (this.overlappingElements) {
        this.renderer.markOverlappingElements(this.overlappingElements);
      }

      // Collapse top-level boxes by default
      // HACK: The collapse/expand functions are asynchronous and trying to execute them all at once
      // seems to create problems with the tracker.
      const collapsedIds = calcNodesToCollapse(this.layout, this.renderer.layout);
      if (collapsedIds.length > 0) {
        collapsedIds.forEach(nextId => this.renderer.collapse(nextId));
        this.renderer.render();
      }
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
