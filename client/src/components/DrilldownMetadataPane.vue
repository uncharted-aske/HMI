<template>
  <div class="drilldown-metadata-pane-container" v-if="metadata">
    <div v-for="(value, key) in metadata" :key="key" class="metadata-item">
      <div class="key"> {{key | capital-letters-formatter | underscore-remover-formatter}} </div>
      <div :class="{'expression': key === 'expression' || key === 'eqn_source', '': key !== 'expression' || key !== 'eqn_source' }">{{value}} </div>
     </div>
  </div>
      <div v-else>
       Empty metadata
     </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  @Component
  export default class DrilldownMetadataPane extends Vue {
    @Prop({ default: null }) metadata: any;
  }
</script>

<style lang="scss" scoped>
.metadata-item {
  text-align: left;
  margin-top: 5px;
  .key {
    font-weight: bold;
    padding-top: 5px;
  }
  .expression {
      font-family:Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New;
  }
}
</style>
