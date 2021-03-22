<template>
    <div class="global-graph-container" ref="graph">
    </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

  import { GraphInterface } from '@/types/typesGraphs';

  import EpiRenderer from '@/graphs/svg/renderers/EpiRenderer';
  import Adapter from '@/graphs/svg/elk/adapter';
  import { layered } from '@/graphs/svg/elk/layouts';
  // import { showTooltip, hideTooltip } from '@/utils/SVGUtil.js';
  // import { calculateNodeNeighborhood } from '@/graphs/svg/util.js';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 40,
    layout: layered,
  };

   const DATA = {
    nodes: [
      { id: 'Node A', label: 'Node A' },
      { id: 'Node B', label: 'Node B' },
      { id: 'Node C', label: 'Node C' },
      {
        id: 'L1',
        label: 'L1',
        nodes: [
          { id: 'Sub 1', label: 'Sub 1' },
          {
            id: 'L2',
            label: 'L2',
            nodes: [
              {
                id: 'L3',
                label: 'L3',
                nodes: [
                  { id: 'L4', label: 'L4' },
                ],
              },
            ],
          },
        ],
      },
    ],
    edges: [
      { id: 'Edge 1', source: 'Node A', target: 'Node B' },
      { id: 'Edge 2', source: 'Sub 1', target: 'Node B' },
      { id: 'Edge 3', source: 'L4', target: 'Node A' },
      { id: 'Edge 4', source: 'L4', target: 'L4' },
      { id: 'Edge 5', source: 'Sub 1', target: 'Node C' },
    ],
  };

  @Component
  export default class GlobalGraph extends Vue {
    @Prop({ default: null }) data: GraphInterface;

    renderingOptions = DEFAULT_RENDERING_OPTIONS;
    renderer = null;

    @Watch('data')
    dataChanged (): void {
      this.refresh();
    }

    mounted (): void {
       this.renderer = new EpiRenderer({
        el: this.$refs.graph,
        adapter: new Adapter(DEFAULT_RENDERING_OPTIONS),
        renderMode: 'basic',
        useEdgeControl: false,
        useZoom: true,
        useMinimap: false,
        addons: [],
      });
      // this.renderer = new LocalEpiModelRenderer({
      //   el: this.$refs.graph,
      //   adapter: new ELKAdapter(DEFAULT_RENDERING_OPTIONS),
      //   renderMode: 'basic',
      // });

      // this.renderer.setCallback('nodeClick', (node) => {
      //   // Clear previous highlights
      //   this.renderer.hideNeighbourhood();
      //   // Show neighborhood
      //   const neighborhood = calculateNodeNeighborhood(this.graph, node.datum());
      //   this.renderer.showNeighborhood(neighborhood);
      //   this.$emit('node-click', node.datum());
      // });

      // this.renderer.setCallback('backgroundDblClick', () => {
      //   this.renderer.hideNeighbourhood();
      //   this.$emit('background-dbl-click');
      // });

      // this.renderer.setCallback('nodeMouseEnter', (node) => {
      //   const nodeData = node.datum();
      //   const nodeCoords = [nodeData.x + (nodeData.width * 0.5), nodeData.y + (nodeData.height * 0.5)]; // TO FIX: It seems there is an issue with coordinates for deeply nested nodes.

      //   const tooltipText = 'Name: ' + nodeData.label + ' ' + 'Type: ' + nodeData.nodeType;

      //   showTooltip(this.renderer.chart, tooltipText, nodeCoords);
      // });

      // this.renderer.setCallback('nodeMouseLeave', () => {
      //   hideTooltip(this.renderer.chart);
      // });

      this.refresh();
    }

    refresh (): void {
      this.renderer.setData(DATA);
      this.renderer.render();
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
