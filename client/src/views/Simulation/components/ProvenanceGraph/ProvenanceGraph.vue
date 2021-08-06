<template>
  <div class="provenance-graph-container" v-if="isOpen">
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
    <provenance-close-button @close="onClose"/>
    <div class="flex-grow-1 position-relative overflow-scroll hide-scrollbar panel-body">
      <slot name="content"/>
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import ProvenanceCloseButton from '@/components/widgets/ProvenanceCloseButton.vue';

  const components = {
    ProvenanceCloseButton,
  };

  @Component({ components })
  export default class ProvenanceGraph extends Vue {
    @Prop({ default: false })
    isOpen: boolean;

    @Prop({ required: false })
    activeTabId: string;

    onClose (): void {
      this.$emit('close-pane');
    }

    onClickCondensed (): void {
      this.$emit('toggle-click', 'condensed');
    }

    onClickExpanded (): void {
      this.$emit('toggle-click', 'expanded');
    }
  }
</script>

<style scoped>
.provenance-graph-container {
  background-color: var(--bg-graphs);
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 25vh;
  padding: 5px;
  width: var(--content-full-width);
  z-index: var(--z-index--side-panel);
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
</style>
