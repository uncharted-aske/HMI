<template>
  <div v-if="metadata" class="metadata-pane-container">
    <div class="metadata-item">
      <div class="key">Name</div>
      <div>{{metadata.name}}</div>
    </div>
    <div class="metadata-item">
       <div class="key">Description</div>
      <div>{{metadata.description}}</div>
    </div>
    <div class="metadata-item">
       <div class="key">Created</div>
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
  import * as KnowledgeGraph from '@/types/typesKnowledgeGraph';

  @Component
  export default class MetadataPanel extends Vue {
    @Prop({ default: null }) metadata: KnowledgeGraph.Metadata;
  }
</script>

<style scoped>
  .metadata-item {
    padding: 20px;
    text-align: left;
    border-bottom: 1px solid rgba(207, 216, 220, .5);
  }

  .metadata-item .key {
    font-weight: bold;
    padding-top: 5px;
  }
</style>
