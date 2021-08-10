<template>
  <div class="global-graph-container" ref="graph" />
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import { expandCollapse, highlight } from 'svg-flowgraph';

  import { GraphInterface } from '@/types/typesGraphs';

  import ProvenanceRenderer from '@/graphs/svg/renderers/ProvenanceRenderer';
  import ELKAdapter from '@/graphs/svg/elk/adapter';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 40,
  };

  @Component({ })
  export default class ProvenanceGraphData extends Vue {
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

      // Print data for debugging
      console.log(this.data);
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
