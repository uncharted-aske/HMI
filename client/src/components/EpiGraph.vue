<template>
  <div class="epi-graph-container" ref="graph">
  </div>
</template>

<script>
  import _ from 'lodash';

  import EpiModelRenderer from '@/graphs/elk/EpiModelRenderer.js';
  import { layered } from '@/graphs/elk/ElkStrategies.js';
  import { showTooltip, hideTooltip } from '@/utils/SVGUtil.js';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 30,
  };

  export default {
    name: 'EpiGraph',
    props: {
      graph: {
        type: Object,
        default: null,
      },
    },
    data: () => ({
      renderingOptions: DEFAULT_RENDERING_OPTIONS,
    }),
    created () {
      this.renderer = null;
    },
    mounted () {
      this.renderer = new EpiModelRenderer(Object.assign({}, {
        el: this.$refs.graph,
        strategy: layered,
        useEdgeControl: false,
        edgeControlOffsetType: 'unit',
        edgeControlOffset: -20,
      }, this.renderingOptions));

      this.renderer.setCallback('nodeClick', (node) => {
        this.$emit('node-click', node.datum());
      });

      this.renderer.setCallback('nodeMouseEnter', (node) => {
        const nodeData = node.datum();
        let nodeCoords = [];
        const metadata = JSON.stringify(nodeData.data.metadata);
        if (_.isNil(nodeData.group)) {
          nodeCoords = [nodeData.x + (nodeData.width * 0.5), nodeData.y + (nodeData.height * 0.5)];
        } else {
          // For nodes inside groups
          const groups = this.renderer.layout.groups;
          const group = groups.find(g => g.id === nodeData.group);
          nodeCoords = [group.x + nodeData.x, group.y + nodeData.y];
        }
        showTooltip(this.renderer.chart, metadata, nodeCoords);
      });

      this.renderer.setCallback('nodeMouseLeave', (node) => {
        hideTooltip(this.renderer.chart);
      });

      const groups = this.graph.groups || [];
      this.renderer.setData(this.graph, { groups });
      this.renderer.render();
    },
  };
</script>

<style lang="scss" scoped>
.epi-graph-container {
  width: 60%;
  height: 800px;
  border: 1px solid red;
}

</style>
