<template>
  <section class="provenance-graph-data" ref="graph" />
</template>

<script lang="ts">
  import _ from 'lodash';

  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';
  import { expandCollapse } from 'svg-flowgraph';
  import { GraphInterface, GraphLayoutInterfaceType } from '@/types/typesGraphs';
  import { DEFAULT_RENDERING_OPTIONS } from '@/graphs/svg/renderers/EpiRenderer';

  import ProvenanceRenderer from '@/graphs/svg/renderers/ProvenanceRenderer';
  import ELKAdapter from '@/graphs/svg/elk/adapter';
  import { hierarchyFn, showTooltip, hideTooltip } from '@/utils/SVGUtil';
  import { calcNodesToCollapse, constructRootNode } from '@/graphs/svg/util';

  @Component({ })
  export default class ProvenanceGraphData extends Vue {
    @Prop({ default: null }) data: GraphInterface;

    renderingOptions = DEFAULT_RENDERING_OPTIONS;
    renderer = null;

    @Watch('data')
    dataChanged (): void {
      this.refresh();
    }

    mounted (): void {
      this.renderer = new ProvenanceRenderer({
        el: this.$refs.graph,
        adapter: new ELKAdapter(DEFAULT_RENDERING_OPTIONS),
        renderMode: 'basic',
        useEdgeControl: false,
        useZoom: true,
        useMinimap: false,
        addons: [expandCollapse],
      });

      // Expand and collapse boxes on double click
      this.renderer.setCallback('nodeDblClick', (evt, node) => {
        if (node.datum().nodes) {
          const id = node.datum().id;
          if (node.datum().collapsed === true) {
            this.renderer.expand(id);
          } else {
            this.renderer.collapse(id);
          }
          this.renderer.render();
        }
      });

      this.renderer.setCallback('nodeMouseEnter', (evt, node, renderer) => {
        const data = node.datum();
        // Only show tooltips for nodes that have data defined (container boxes and "Models" nodes don't)
        if (data.data.nodeType) showTooltip(renderer.chart, data.data.nodeType, [data.x + data.width / 2, data.y], -Math.PI / 2, true);
      });

      this.renderer.setCallback('nodeMouseLeave', (evt, node, renderer) => {
        hideTooltip(renderer.chart);
      });

      this.refresh();
    }

    async refresh (): Promise<void> {
      if (!this.data) return;
      let data = _.cloneDeep(this.data);

      // Transform the flat nodes structure into a hierarchical one
      const nodesHierarchy = hierarchyFn(data.nodes);
      constructRootNode(nodesHierarchy); // Parse the data to a format that the graph renderer understands
      data = { nodes: [nodesHierarchy], edges: data.edges };

      this.renderer.setData(data);
      await this.renderer.render();

      // Collapse top-level boxes by default
      const collapsedIds = calcNodesToCollapse(GraphLayoutInterfaceType.elk, this.renderer.layout);
      if (collapsedIds.length > 0) {
        collapsedIds.forEach(nextId => this.renderer.collapse(nextId));
        this.renderer.render();
      }
    }
  }
</script>

<style scoped>
  .provenance-graph-data {
    background-color: var(--bg-graphs);
    flex: 1;
    overflow: hidden;
  }

  .provenance-graph-data::v-deep > svg {
    height: 100%;
    width: 100%;
  }
</style>
