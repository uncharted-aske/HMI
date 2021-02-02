<template>
<div class="h-100 d-flex flex-column">
  <ul class="nav nav-tabs">
    <li class="nav-item">
      <a class="nav-link active">Preview</a>
    </li>
    <li class="nav-item">
      <a class="nav-link disabled">Models</a>
    </li>
    <li class="nav-item">
      <a class="nav-link disabled">Entities</a>
    </li>
  </ul>
  <knowledge-tab-preview
    class="mt-3 mx-1 d-flex flex-column flex-grow-1"
    v-if="activeTab === 0"
    @open-drilldown="$emit('open-drilldown')"
    :card="card"
  />
</div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import KnowledgeTabPreview from './KnowledgeTabPreview.vue';

  const components = {
    KnowledgeTabPreview,
  };

  @Component({ components })
  export default class KnowledgePanel extends Vue {
    @Prop({ required: false }) private card: any;

    activeTab: number = 0;
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

</style>
