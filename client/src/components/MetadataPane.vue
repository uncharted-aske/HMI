<template>
  <div class="metadata-pane-container" v-if="metadata">
    <div class="metadata-item">
      <div class="key">Name</div>
      <div>{{metadata.name}}</div>
    </div>
    <div class="metadata-item">
       <div class="key">Description</div>
      <div>{{metadata.description}}</div>
    </div>
    <div class="metadata-item">
       <div class="key">Createed</div>
      <div>{{metadata.created}}</div>
    </div>
    <div class="metadata-item">
       <div class="key">Source</div>
      <div>{{metadata.source}}</div>
    </div>
    <div class="metadata-item">
       <div class="key">Version</div>
      <div>{{metadata.version}}</div>
    </div>
    <div class="metadata-item">
       <div class="key">Knowledge</div>
      <div><a class="text-link" :href="metadata.knowledge">{{metadata.knowledge}}</a> </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import { ModelMetadataInterface } from '../types/types';

  @Component
  export default class MetadataPane extends Vue {
    @Prop({ default: null }) metadata: ModelMetadataInterface;
  }
</script>

<style lang="scss" scoped>
.metadata-item {
  padding: 20px;
  text-align: left;
  border-bottom: 1px solid rgba(207, 216, 220, .5);
  .key {
    font-weight: bold;
  }
}
</style>
