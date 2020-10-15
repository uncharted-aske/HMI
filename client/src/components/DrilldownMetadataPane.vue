<template>
  <div class="drilldown-metadata-pane-container">
    <div class="metadata-item">
       <div class="key">Description</div>
      <div v-if="metadata.description">{{metadata.description}}</div>
      <div v-else> No description </div>
    </div>
    <div class="metadata-item">
       <div class="key">Expression</div>
      <div v-if="metadata.expression" class="expression">{{metadata.expression}}</div>
      <div v-else> No expression </div>
    </div>
    <div class="metadata-item">
       <div class="key">Knowledge Source(s)</div>
      <div v-if="metadata.knowledge">{{metadata.knowledge}}</div>
      <div v-else> Empty </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import { ModelComponentMetadataInterface } from '../types/types';

  @Component
  export default class DrilldownMetadataPane extends Vue {
    @Prop({ default: null }) metadata: ModelComponentMetadataInterface;
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
