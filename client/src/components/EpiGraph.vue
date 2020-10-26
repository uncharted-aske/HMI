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

  import EpiModelRenderer from '../graphs/elk/EpiModelRenderer.js';
  import { layered } from '../graphs/elk/ElkStrategies.js';
  import { showTooltip, hideTooltip } from '../utils/SVGUtil.js';
  import { calculateNeighborhood } from '../utils/GraphUtil.js';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 30,
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
      console.log('mounted');
      this.renderer = new EpiModelRenderer(Object.assign({}, {
        el: this.$refs.graph,
        strategy: layered,
        useEdgeControl: false,
        edgeControlOffsetType: 'unit',
        edgeControlOffset: -20,
      }, this.renderingOptions));

      this.renderer.setCallback('backgroundDblClick', () => {
        this.renderer.hideNeighbourhood();
      });

      this.renderer.setCallback('nodeClick', (node) => {
        this.$emit('node-click', node.datum());
        const neighborhood = calculateNeighborhood(this.graph, node.datum().id);
        this.renderer.showNeighborhood(neighborhood);
      });

      this.renderer.setCallback('nodeMouseEnter', (node) => {
        const nodeData = node.datum();
        let nodeCoords = [];
        const tooltipText = 'Name: ' + nodeData.label + ' ' + 'Type: ' + nodeData.data.type;
        if (_.isNil(nodeData.group)) {
          nodeCoords = [nodeData.x + (nodeData.width * 0.5), nodeData.y + (nodeData.height * 0.5)];
        } else {
          // For nodes inside groups
          const groups = this.renderer.layout.groups;
          const group = groups.find(g => g.id === nodeData.group);
          nodeCoords = [group.x + nodeData.x, group.y + nodeData.y];
        }
        showTooltip(this.renderer.chart, tooltipText, nodeCoords);
      });

      this.renderer.setCallback('nodeMouseLeave', () => {
        hideTooltip(this.renderer.chart);
      });

      const groups = this.graph.groups || [];
      this.renderer.setData(this.graph, { groups });
      this.renderer.render();
    }

    refresh (): void {
       const groups = this.graph.groups || [];
      this.renderer.setData(this.graph, { groups });
      this.renderer.render();
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
