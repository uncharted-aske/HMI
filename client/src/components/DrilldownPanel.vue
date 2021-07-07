<template>
  <div class="drilldown-panel-container" v-if="isOpen">
    <div
      v-if="tabs.length > 1"
      class="mb-2"
    >
      <ul class="nav nav-tabs">
        <li v-for="(tab) in tabs" :key="tab.id" class="nav-item">
          <div
            :class="activeTabId === tab.id ? 'nav-link active' : 'nav-link'"
            @click="onTabClick(tab.id)"
          >
            {{tab.name}}
          </div>
        </li>
      </ul>
    </div>
    <div class="panel-header" v-if="displayHeader">
      <h5>{{paneTitle}}</h5>
      <h6>{{paneSubtitle}}</h6>
    </div>
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

  import { TabInterface } from '@/types/types';

  import CloseButton from '@/components/widgets/CloseButton.vue';

  const components = {
    CloseButton,
  };

  @Component({ components })
  export default class DrilldownPanel extends Vue {
    @Prop({ default: false })
    isOpen: boolean;

    @Prop({ default: () => [] })
    tabs: TabInterface[];

    @Prop({ required: false })
    activeTabId: string;

    @Prop({ default: '' })
    paneTitle: string;

    @Prop({ default: '' })
    paneSubtitle: string;

    get displayHeader (): boolean {
      return Boolean(this.paneTitle || this.paneSubtitle);
    }

    onClose (): void {
      this.$emit('close-pane');
    }

    onTabClick (tabId: string): void {
      this.$emit('tab-click', tabId);
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.drilldown-panel-container {
  min-width: 25vw;
  height: 100%;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  box-sizing: border-box;
  padding: 5px;
  z-index: map-get($z-index-order, side-panel);

  .panel-header {
    text-align: left;
    border-bottom: var(--border);
    padding: 5px;
    .nav-tabs {
      cursor: pointer;
    }
  }
  .panel-body {
    margin-top: 5px;
  }
}

.nav-link.active {
  cursor: default;
  border-bottom: 3px solid var(--selection);
}
.nav-link:not(.active) {
  cursor: pointer;
}

</style>
