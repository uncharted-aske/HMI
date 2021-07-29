<template>
    <div class="global-graph-container" ref="graph">
    </div>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
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
    @Prop({ default: () => [] }) editedNodes: SubgraphNodeInterface[];
    @Prop({ default: GraphLayoutInterfaceType.elk }) layout: string;

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

    @Watch('editedNodes')
    async editedNodesChanged (): Promise<void> {
      this.renderer.markEditedNodes(this.editedNodes);
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
          this.$emit('node-dblclick', node.datum().data);
      });

      this.renderer.setCallback('nodeClick', (evt, node) => {
        this.renderer.hideSubgraph();

        if (node.datum().nodes) {
          const id = node.datum().id;
          if (node.datum().collapsed === true) {
            this.renderer.expand(id);
          } else {
            this.renderer.collapse(id);
          }
          this.renderer.render();
        } else {
          const neighborhood = calculateNodeNeighborhood(this.data, node.datum());
          this.renderer.showSubgraph(neighborhood);

          this.renderer.clearSelections();
          this.renderer.selectNode(node);
          this.$emit('node-click', node.datum().data);
        }
      });

      this.renderer.setCallback('backgroundClick', () => {
          this.renderer.hideSubgraph();
          this.renderer.clearSelections();
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
        this.renderer.render();
      }
    }
  }
</script>

<style scoped>
.global-graph-container {
  background-color: var(--bg-graphs);
  flex: 1;
}

.global-graph-container::v-deep > svg {
  height: 100%;
  width: 100%;
}

</style>
