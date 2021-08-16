<template>
  <section class="provenance-graph-data" ref="graph" />
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';
  import { expandCollapse } from 'svg-flowgraph';
  import { GraphInterface } from '@/types/typesGraphs';
  import { DEFAULT_RENDERING_OPTIONS } from '@/graphs/svg/renderers/EpiRenderer';

  import ProvenanceRenderer from '@/graphs/svg/renderers/ProvenanceRenderer';
  import ELKAdapter from '@/graphs/svg/elk/adapter';

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

      this.refresh();
    }

    async refresh (): Promise<void> {
      if (!this.data) return;
      this.renderer.setData(this.data);
      await this.renderer.render();
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
