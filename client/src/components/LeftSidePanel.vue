<template>
  <div
    class="left-side-panel-container"
    :class="[isOpen ? '' : 'closed']"
  >
    <div class="navigation-control">
      <button
        class="btn"
        @click="togglePanel()"
      >
        <font-awesome-icon :icon="['fas', navigationIcon ]" />
      </button>
    </div>

    <div class="tab-panel">
        <ul class="nav nav-tabs">
            <li class="nav-item"
                v-for="tab in tabs"
                :key="tab.id"
                @click="onTabClick(tab.id)"
            >
                <a class="nav-link"
                  :class="{'active': activeTabId === tab.id}"
                  href="#">{{tab.name}}</a>
            </li>
        </ul>
    </div>
    <div class="panel-content">
        <slot name="content" />
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import { TabInterface } from '@/types/types';

  @Component
  export default class LeftSidePanel extends Vue {
    @Prop({ default: () => [] })
    tabs: TabInterface[];

    @Prop({ default: '' })
    activeTabId: string;

    isOpen: boolean = false;

    get navigationIcon (): string {
      return this.isOpen === true ? 'angle-double-left' : 'angle-double-right';
    }

    togglePanel (): void {
        this.isOpen = !this.isOpen;
    }

    onTabClick (tabId: string): void {
      this.$emit('tab-click', tabId);
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

  .left-side-panel-container {
    background-color: #ffffff;
    box-sizing: border-box;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    height: $content-full-height;
    padding: 5px;
    position: relative; // for .navigation-control
    width: 25vw;
    will-change: width;
    z-index: map-get($z-index-order, side-panel);

    &.closed {
      padding: 0px;
      width: 0px;

      .tab-panel, .panel-content {
        display: none;
      }
    }
  }

  .navigation-control {
    width: 20px;
    height: 75px;
    position: absolute;
    right: -1vw;
    bottom: 50vh;
    display: flex;
    flex-direction: row;
    align-items: center;
    .btn {
      height: 100%;
      background-color: #ffffff;
      padding: 5px;
      box-shadow: 0 -1px 0 #e5e5e5, 0 0 2px rgba(0,0,0,.12), 0 2px 4px rgba(0,0,0,.24);
      &:hover {
        background-color: $muted-highlight;
      }
    }

  }

  .nav-link.active {
    cursor: default;
    border-bottom: 3px solid $selection;
  }
  .nav-link:not(.active) {
    cursor: pointer;
  }

  .panel-content {
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
