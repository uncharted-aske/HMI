<template>
  <div class="local-graph-container" ref="graph" />
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

  import { GraphInterface } from '@/types/typesGraphs';

  import BioLocalRenderer from '@/graphs/svg/renderers/BioLocalRenderer';
  import ELKAdapter from '@/graphs/svg/elk/adapter';
  import { calculateNodeNeighborhood, calculateEdgeNeighborhood } from '@/graphs/svg/util';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 40,
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
        adapter: new ELKAdapter(DEFAULT_RENDERING_OPTIONS),
        renderMode: 'basic',
        useEdgeControl: true,
        edgeControlOffset: 0.5,
        useZoom: true,
        useMinimap: false,
        addons: [],
      });

      this.renderer.setCallback('nodeClick', (e: PointerEvent, node) => {
        // Clear previous highlights
        this.renderer.hideSubgraph();
        // Show neighborhood
        const neighborhood = calculateNodeNeighborhood(this.data, node.datum());
        this.renderer.showSubgraph(neighborhood);

        this.renderer.clearSelections();
        this.renderer.selectNode(node);
        this.$emit('node-click', node.datum());
      });

      this.renderer.setCallback('edgeClick', (e: PointerEvent, edge) => {
        // Clear previous highlights
        this.renderer.hideSubgraph();
        // Show neighborhood
        const neighborhood = calculateEdgeNeighborhood(edge.datum());
        this.renderer.showSubgraph(neighborhood);
        // Hack: get labels for source and target
        const sourceNode = this.renderer.layout.data.nodes.find(node => node.id === edge.datum().source);
        const targetNode = this.renderer.layout.data.nodes.find(node => node.id === edge.datum().target);

        edge.datum().data.sourceLabel = sourceNode.label;
        edge.datum().data.targetLabel = targetNode.label;
        this.$emit('edge-click', edge.datum());
      });

      this.renderer.setCallback('backgroundClick', () => {
        this.renderer.clearSelections();
        this.renderer.hideSubgraph();
        this.$emit('background-click');
      });

      this.refresh();
    }

    async refresh (): Promise<void> {
      if (this.data) {
        this.renderer.setData(this.data);
        await this.renderer.render();
        this.$emit('loaded');
      }
    }
  }
</script>

<style scoped>
  .local-graph-container {
    background-color: var(--bg-graphs);
    flex: 1;
  }

  .local-graph-container::v-deep > svg {
    height: 100%;
    width: 100%;
  }
</style>
