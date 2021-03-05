<template>
<drilldown-panel @close-pane="$emit('close-pane')" :is-open="isOpen" :tabs="tabsList">

</drilldown-panel>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import DrilldownPanel from '@/components/DrilldownPanel.vue';

  import { TabInterface } from '@/types/types';

  const components = {
    DrilldownPanel,
  };

  @Component({ components })
  export default class DrilldownPane extends Vue {
    @Prop({ required: false }) private data: any;

    @Prop({ default: false }) isOpen: boolean;

    tabsList: TabInterface[] = [
      { id: '0', name: 'Metadata', icon: '' },
      { id: '1', name: 'Parameters', icon: '' },
      { id: '2', name: 'Knowledge', icon: '' },
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
