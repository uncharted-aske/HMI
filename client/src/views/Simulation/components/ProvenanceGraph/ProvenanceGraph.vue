<template>
  <div class="provenance-graph-container">
    <aside slot="left">
      <div class="btn-group btn-group-sm">
        <button
          v-for="layout in layouts" :key="layout.id"
          class="btn btn-secondary"
          type="button"
          :class="{'active': layout.id === selectedLayoutId}"
          @click="onLayoutSelection(layout.id)"
        >
          {{ layout.name }}
        </button>
      </div>
      <h6 class="d-inline-block">{{sessionMetadata}}</h6>
    </aside>
    <close-button @close="onClose"/>
    <div class="flex-grow-1 position-relative overflow-scroll hide-scrollbar panel-body">
      <slot name="content"/>
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import CloseButton from '@/components/widgets/CloseButton.vue';
  import { ProvenanceLayoutInterface } from '@/views/Simulation/components/ProvenanceGraph/ProvenanceData';

  const components = {
    CloseButton,
  };

  @Component({ components })
  export default class ProvenanceGraph extends Vue {
    @Prop({ default: () => [] }) layouts: ProvenanceLayoutInterface[];
    @Prop({ default: '' }) selectedLayoutId: string;

    sessionMetadata: string = ' | Start Time: 2021-08-27T11:00:00';

    onClose (): void {
      this.$emit('close-pane');
    }

    onLayoutSelection (layoutId:string):void {
      this.$emit('layout-change', layoutId);
    }
  }
</script>

<style scoped>
.provenance-graph-container {
  background-color: var(--bg-graphs);
  box-sizing: border-box;
  color: white;
  display: flex;
  flex-direction: column;
  height: var(--provenance-graph-height);
  padding: 5px;
  width: var(--content-full-width);
  z-index: var(--z-index--side-panel);
}

.provenance-graph-data {
  height: var(--provenance-graph-height);
  width: var(--content-full-width);
}

.panel-body {
  margin-top: 5px;
  overflow-x: hidden;
  overflow-y: auto;
}

.nav-link.active {
  cursor: default;
  border-bottom: 3px solid var(--selection);
}

.nav-link:not(.active) {
  cursor: pointer;
}

div > .close-button {
  top: 66px;
}
</style>
