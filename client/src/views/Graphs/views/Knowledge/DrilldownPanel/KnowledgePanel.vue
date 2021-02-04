<template>
<drilldown-panel @close-pane="$emit('close-pane')" :is-open="isOpen" :tabs="tabsList">
  <knowledge-tab-preview
    slot="0"
    class="pt-3 px-1 tab"
    @open-drilldown="$emit('open-drilldown')"
    :data="data"
  />
  <knowledge-tab-models
    slot="1"
    class="pt-3 px-1 tab"
    :data="data"
  />
  <knowledge-tab-entities
    slot="2"
    class="pt-3 px-1 tab"
    :data="data"
  />
</drilldown-panel>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import DrilldownPanel from '@/components/DrilldownPanel.vue';

  import KnowledgeTabPreview from './components/KnowledgeTabPreview.vue';
  import KnowledgeTabModels from './components/KnowledgeTabModels.vue';
  import KnowledgeTabEntities from './components/KnowledgeTabEntities.vue';

  import { TabInterface } from '@/types/types';

  const components = {
    DrilldownPanel,
    KnowledgeTabPreview,
    KnowledgeTabModels,
    KnowledgeTabEntities,
  };

  @Component({ components })
  export default class KnowledgePanel extends Vue {
    @Prop({ required: false }) private data: any;

    @Prop({ default: false }) isOpen: boolean;

    tabsList: TabInterface[] = [
      { id: '0', name: 'Preview', icon: '' },
      { id: '1', name: 'Models', icon: '' },
      { id: '2', name: 'Entities', icon: '' },
    ];
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.tab {
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
