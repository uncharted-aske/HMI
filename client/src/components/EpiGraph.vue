<template>
  <div class="epi-graph-container" ref="graph">
  </div>
</template>

<script>
  import EpiModelRenderer from '@/graphs/elk/EpiModelRenderer.js';
  import { layered } from '@/graphs/elk/ElkStrategies.js';

  const DEFAULT_RENDERING_OPTIONS = {
    nodeWidth: 120,
    nodeHeight: 30
  };

  export default {
     name: 'EpiGraph',
     props: {
       graph: {
         type: Object,
         default: null
       }
     },
     data: () => ({
      renderingOptions: DEFAULT_RENDERING_OPTIONS
     }),
     created() {
       this.renderer = null;
     },
     mounted() {
       this.renderer = new EpiModelRenderer(Object.assign({}, {
        el: this.$refs.graph,
        strategy: layered,
        useEdgeControl: false,
        edgeControlOffsetType: 'unit',
        edgeControlOffset: -20
      }, this.renderingOptions));


      const groups = this.graph.groups || [];
      this.renderer.setData(this.graph, { groups });
      this.renderer.render();
     }
  }
</script>

<style lang="scss" scoped>
.epi-graph-container {
  width: 100%;
  height: 800px;
}

</style>
