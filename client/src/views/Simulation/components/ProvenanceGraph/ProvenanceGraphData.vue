<template>
  <section class="provenance-graph-data">
    <h6>{{header}}</h6>
  </section>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  @Component({ })
  export default class ProvenanceGraphData extends Vue {
    @Prop({ required: false }) private data: any;

    // This is a placeholder to show the toggle between expanded and condensed
    get header (): string {
      if (this.data != null) {
        return this.data;
      } else {
        return 'Placeholder';
      }
    }
  }
</script>

<style scoped>
  .provenance-graph-data {
    display: flex;
    color: #ffffff;
  }
</style>
