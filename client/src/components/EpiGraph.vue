<template>
    <div class="epi-graph-container" ref="graph">
    </div>
</template>

<script lang="ts">
  import _ from 'lodash';
  import * as d3 from 'd3';
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

  import { GraphInterface } from '../types/types';

  import NewEpiModelRenderer from '../graphs/svg/NewEpiModelRenderer.js';
  import ELKAdapter from '../graphs/svg/elk/adapter.js';
  import { layered } from '../graphs/elk/ElkStrategies.js';
  import { traverse } from '../graphs/svg/util.js';
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
    // convert the flat data into a hierarchy
    const treeData = d3.stratify()
      .id((d) => d.concept)
      .parentId((d) => d.parent_name)
      (this.graph.nodes);

    function traverse (root) {
      root.concept = root.data.concept;
      root.label = root.data.label;
      if (root.children) {
        root.nodes = root.children;
        delete root.children;
        for (let i = 0; i < root.nodes.length; i++) {
          traverse(root.nodes[i]);
        }
      }
    }

    traverse(treeData);

      this.renderer = new NewEpiModelRenderer({
        el: this.$refs.graph,
        adapter: new ELKAdapter({ nodeWidth: 100, nodeHeight: 50, layout: layered }),
        renderMode: 'delta',
      });

      this.renderer.setCallback('nodeClick', (node, renderer, event) => {
        if (!node.datum().collapsed || node.datum().collapsed === false) {
          this.renderer.collapse(node.datum().id);
        } else {
          this.renderer.expand(node.datum().id);
        }
      });
      this.renderer.setCallback('nodeDblClick', (node) => {
        if (node.datum().focused === true) {
          this.renderer.unfocus(node.datum().id);
        } else {
          this.renderer.focus(node.datum().id);
        }
      });

      this.renderer.setData({nodes: treeData.nodes, edges: this.graph.edges});
      this.renderer.render();

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
