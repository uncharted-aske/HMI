<template>
  <div class="drilldown-panel-container" v-if="isOpen" :key="rerenderKey">
    <div
      v-if="tabs.length > 1"
      class="mb-2"
    >
      <ul class="nav nav-tabs">
        <li v-for="(tab) in tabs" :key="tab.id" class="nav-item">
          <div
            :class="_activeTabId === tab.id ? 'nav-link active' : 'nav-link'"
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
      <slot :name="_activeTabId"/>
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

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

    @Watch('activeTabId')
    onActiveTabIdChanged (): void {
      this._activeTabId = this.activeTabId;
    }

    rerenderKey: number = 0;
    _activeTabId: string;

    forceRerender (): void {
      this.rerenderKey += 1;
    }

    created (): void {
      if (this.activeTabId !== undefined) {
        this._activeTabId = this.activeTabId;
      } else if (this.tabs.constructor === Array && this.tabs.length > 0) {
        this._activeTabId = this.tabs[0].id;
      }
    }

    get displayHeader (): boolean {
      return Boolean(this.paneTitle || this.paneSubtitle);
    }

    onClose (): void {
      this.$emit('close-pane');
    }

    onTabClick (tabId: string): void {
      this.$emit('tab-click', tabId);
      if (this.activeTabId === undefined) {
        this._activeTabId = tabId;
        this.forceRerender();
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.drilldown-panel-container {
  width: 25vw;
  height: 100%;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  position: absolute;
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
    border-bottom: 1px solid $border;
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
}
.nav-link:not(.active) {
  cursor: pointer;
}

</style>
