<template>
<drilldown-panel @close-pane="$emit('close-pane')" :is-open="isOpen" :tabs="tabsList">
  <knowledge-tab-preview
    class="mt-3 mx-1 d-flex flex-column h-100 overflow-hidden"
    slot="0"
    @open-drilldown="$emit('open-drilldown')"
    :card="card"
  />
  <knowledge-tab-models
    class="mt-3 mx-1 d-flex flex-column h-100 overflow-hidden"
    slot="1"
    :card="card"
  />
  <knowledge-tab-entities
    class="mt-3 mx-1 d-flex flex-column h-100 overflow-hidden"
    slot="2"
    :card="card"
  />
</drilldown-panel>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import DrilldownPanel from '@/components/DrilldownPanel.vue';

  import KnowledgeTabPreview from './KnowledgeTabPreview.vue';
  import KnowledgeTabModels from './KnowledgeTabModels.vue';
  import KnowledgeTabEntities from './KnowledgeTabEntities.vue';

  import { TabInterface } from '@/types/types';

  const components = {
    DrilldownPanel,
    KnowledgeTabPreview,
    KnowledgeTabModels,
    KnowledgeTabEntities,
  };

  @Component({ components })
  export default class KnowledgePanel extends Vue {
    @Prop({ required: false }) private card: any;

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

</style>
