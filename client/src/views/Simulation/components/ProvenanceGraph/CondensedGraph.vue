<template>
  <section class="condensed-graph">
    <h6>{{header}}</h6>
  </section>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  @Component({ })
  export default class CondensedGraph extends Vue {
    @Prop({ required: false }) private data: any;

    get header (): string {
      return 'Condensed Provenance Graph Placeholder';
    }
  }
</script>

<style scoped>
  .condensed-graph {
    display: flex;
    color: #ffffff;
  }
</style>
