<template>
  <div class="provenance-graph-container">
    <aside slot="left">
      <div class="btn-group btn-group-sm">
        <button
          class="btn btn-secondary"
          @click="onClickCondensed"
          > Condensed
        </button>
        <button
          class="btn btn-secondary"
          @click="onClickExpanded"
          > Expanded
        </button>
      </div>
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

  const components = {
    CloseButton,
  };

  @Component({ components })
  export default class ProvenanceGraph extends Vue {
    @Prop({ required: false })
    activeTabId: string;

    onClose (): void {
      this.$emit('close-pane');
    }

    onClickCondensed (): void {
      this.$emit('layout-change', 'condensed');
    }

    onClickExpanded (): void {
      this.$emit('layout-change', 'expanded');
    }
  }
</script>

<style scoped>
.provenance-graph-container {
  background-color: var(--bg-graphs);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 25vh;
  padding: 5px;
  width: var(--content-full-width);
  z-index: var(--z-index--side-panel);
}

.provenance-graph-data {
  height: 24vh;
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
