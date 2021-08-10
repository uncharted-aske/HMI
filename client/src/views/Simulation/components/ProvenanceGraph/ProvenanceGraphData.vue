<template>
  <div class="global-graph-container" ref="graph" />
  <!-- <section class="header">
    <h6>{{header}}</h6>
  </section> -->
</template>

<script lang="ts">
  import _ from 'lodash';

  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import { expandCollapse, highlight } from 'svg-flowgraph';

  import { GraphInterface } from '@/types/typesGraphs';

  import ProvenanceRenderer from '@/graphs/svg/renderers/ProvenanceRenderer';
  import ELKAdapter from '@/graphs/svg/elk/adapter';
  import DagreAdapter from '@/graphs/svg/dagre/adapter';
  import { /** showTooltip, hideTooltip */ hierarchyFn } from '@/utils/SVGUtil.js';
  import { calculateNodeNeighborhood, constructRootNode, calcNodesToCollapse } from '@/graphs/svg/util.js';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 40,
  };

  @Component({ })
  export default class ProvenanceGraphData extends Vue {
    // @Prop({ required: false }) private data: any;

    // // This is a placeholder to show the toggle between expanded and condensed
    // get header (): string {
    //   if (this.data != null) {
    //     return this.data;
    //   } else {
    //     return 'Placeholder';
    //   }
    // }

    @Prop({ default: null }) data: GraphInterface;

    renderingOptions = DEFAULT_RENDERING_OPTIONS;
    renderer = null;

    mounted (): void {
      this.renderer = new ProvenanceRenderer({
        el: this.$refs.graph,
        adapter: new ELKAdapter(DEFAULT_RENDERING_OPTIONS),
        renderMode: 'basic',
        useEdgeControl: false,
        useZoom: true,
        useMinimap: false,
        addons: [expandCollapse, highlight],
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

      // Print data for debugging
      console.log(data);

      this.renderer.setData(this.data);
      await this.renderer.render();
    }
  }
</script>

<style scoped>
  .provenance-graph-data {
    display: flex;
    color: #ffffff;
  }

  .provenance-graph-data::v-deep > svg {
    height: 100%;
    width: 100%;
  }
</style>
