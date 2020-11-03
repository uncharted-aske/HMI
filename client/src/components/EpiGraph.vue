<template>
    <div class="epi-graph-container" ref="graph">
    </div>
</template>

<script lang="ts">
  import _ from 'lodash';
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

  import { GraphInterface } from '../types/types';

  import NewEpiModelRenderer from '../graphs/svg/NewEpiModelRenderer.js';
  import ELKAdapter from '../graphs/svg/elk/adapter.js';
  import { layered } from '../graphs/elk/ElkStrategies.js';
  import { showTooltip, hideTooltip } from '../utils/SVGUtil.js';
  import { calculateNeighborhood } from '../utils/GraphUtil.js';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 30,
  };

  const lazy = (s) => { return { id: s, concept: s, label: s }; };
  const DATA = {
    nodes: [
      lazy('Node 0'),
      lazy('Node 1'),
      lazy('Node 2'),
      {
        ...lazy('Group'),
        nodes: [
          lazy('Sub 1'),
          lazy('Sub 2')
        ]
      },
      lazy('Node 3'),
      {
        ...lazy('Node 4'),
        nodes: [
          {
            ...lazy('Sub 3'),
            nodes: [
              lazy('Sub-sub')
            ]
          }
        ]
      }
    ],
    edges: [
      { id: '0', source: 'Node 0', target: 'Node 1' },
      { id: '1', source: 'Node 1', target: 'Node 2' },
      { id: '2', source: 'Node 2', target: 'Sub 1' },
      { id: '3', source: 'Node 2', target: 'Sub 2' },
      { id: '4', source: 'Sub 2', target: 'Node 3' },
      { id: '5', source: 'Node 0', target: 'Node 3' },
      { id: '6', source: 'Node 3', target: 'Node 4' }
    ]
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
      this.renderer = new NewEpiModelRenderer({
        el: this.$refs.graph,
        adapter: new ELKAdapter({ nodeWidth: 100, nodeHeight: 50, layout: layered }),
        renderMode: 'basic',
      });

      this.renderer.setData(DATA);
      this.renderer.render();
      // this.renderer = new EpiModelRenderer(Object.assign({}, {
      //   el: this.$refs.graph,
      //   strategy: layered,
      //   useEdgeControl: false,
      //   edgeControlOffsetType: 'unit',
      //   edgeControlOffset: -20,
      // }, this.renderingOptions));

      // this.renderer.setCallback('backgroundDblClick', () => {
      //   this.renderer.hideNeighbourhood();
      // });

      // this.renderer.setCallback('nodeClick', (node) => {
      //   this.$emit('node-click', node.datum().data);
      //   const neighborhood = calculateNeighborhood(this.graph, node.datum().id);
      //   this.renderer.showNeighborhood(neighborhood);
      // });

      // this.renderer.setCallback('nodeMouseEnter', (node) => {
      //   const nodeData = node.datum();
      //   let nodeCoords = [];
      //   const tooltipText = 'Name: ' + nodeData.label + ' ' + 'Type: ' + nodeData.data.type;
      //   if (_.isNil(nodeData.group)) {
      //     nodeCoords = [nodeData.x + (nodeData.width * 0.5), nodeData.y + (nodeData.height * 0.5)];
      //   } else {
      //     // For nodes inside groups
      //     const groups = this.renderer.layout.groups;
      //     const group = groups.find(g => g.id === nodeData.group);
      //     nodeCoords = [group.x + nodeData.x, group.y + nodeData.y];
      //   }
      //   showTooltip(this.renderer.chart, tooltipText, nodeCoords);
      // });

      // this.renderer.setCallback('nodeMouseLeave', () => {
      //   hideTooltip(this.renderer.chart);
      // });

      // const groups = this.graph.groups || [];
      // this.renderer.setData(this.graph, { groups });
      // this.renderer.render();
    }

    refresh (): void {
      // const groups = this.graph.groups || [];
      // this.renderer.setData(this.graph, { groups });
      // this.renderer.render();
    }
  }
</script>

<style lang="scss" scoped>
@import "../styles/variables";

.epi-graph-container {
  height: calc(#{$content-full-height} - #{$secondary-bar-width} - 25px);
  width: 80%;
}

</style>
