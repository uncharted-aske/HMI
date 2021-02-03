<template>
<drilldown-panel @close-pane="$emit('close-pane')" :is-open="isOpen" :tabs="tabsList">
  <knowledge-tab-preview
    slot="0"
    :class="tabClass"
    @open-drilldown="$emit('open-drilldown')"
    :card="card"
  />
  <knowledge-tab-models
    slot="1"
    :class="tabClass"
    :card="card"
  />
  <knowledge-tab-entities
    slot="2"
    :class="tabClass"
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

    tabClass: string = 'pt-3 px-1 d-flex flex-column position-absolute h-100 w-100 overflow-hidden';
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

</style>
