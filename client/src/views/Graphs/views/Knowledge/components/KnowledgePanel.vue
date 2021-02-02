<template>
<div class="h-100 d-flex flex-column">
  <ul class="nav nav-tabs">
    <li v-for="(tabName, index) in tabList" class="nav-item" @click="setActiveTab(index)" :key="index">
      <div :class="`nav-link ${activeTab === index ? 'active' : ''}`">
        {{tabName}}
      </div>
    </li>
  </ul>
  <knowledge-tab-preview
    class="mt-3 mx-1 d-flex flex-column flex-grow-1 overflow-hidden"
    v-if="activeTab === 0"
    @open-drilldown="$emit('open-drilldown')"
    :card="card"
  />
  <knowledge-tab-models
    class="mt-3 mx-1 d-flex flex-column flex-grow-1 overflow-hidden"
    v-if="activeTab === 1"
    :card="card"
  />
  <knowledge-tab-entities
    class="mt-3 mx-1 d-flex flex-column flex-grow-1 overflow-hidden"
    v-if="activeTab === 2"
    :card="card"
  />
</div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import KnowledgeTabPreview from './KnowledgeTabPreview.vue';
  import KnowledgeTabModels from './KnowledgeTabModels.vue';
  import KnowledgeTabEntities from './KnowledgeTabEntities.vue';

  const components = {
    KnowledgeTabPreview,
    KnowledgeTabModels,
    KnowledgeTabEntities,
  };

  @Component({ components })
  export default class KnowledgePanel extends Vue {
    @Prop({ required: false }) private card: any;

    tabList: string[] = ['Preview', 'Models', 'Entities'];
    activeTab: number = 0;

    setActiveTab (tabNum: number): void {
      this.activeTab = tabNum;
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.nav-link.active {
  cursor: default;
}
.nav-link:not(.active) {
  cursor: pointer;
}
</style>
