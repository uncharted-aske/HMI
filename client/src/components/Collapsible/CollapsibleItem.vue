<template>
  <div class="collapsible-item">
    <div class="item-container">
      <div
        class="item-title"
        @click="toggle()">
        <font-awesome-icon class="icon" :icon="['fas', getIcon]"/>
        <slot name="title" />
      </div>
    </div>
    <div class="flex-grow-1 position-relative" v-if="expandedState">
      <slot name="content" />
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';

/**
 * A collapsible wrapper component that allows the injection of two external
 * fragments into the template slots.
 *
 * - title: title bar elements
 * - content: elements to be displayed
 *
 * For example:
 *   <collapsible-item>
 *      <div slot="title"> This replaces the header slot in template</div>
 *      <div slot="content">
 *          This paragraph replaces the content slot in template
 *          <img src="something"/>
 *      </div>
 *   </collapsible-item>
 *
*/

  @Component
  export default class CollapsibleItem extends Vue {
    @Prop({ default: false }) expanded: boolean;
    expandedState: boolean = false;

    @Watch('expanded') onExpandedChange (): void {
      this.expandedState = this.expanded;
    }

    mounted (): void {
      this.expandedState = this.expanded;
    }

    get getIcon (): string {
        return this.expandedState ? 'caret-down' : 'caret-right';
    }

    toggle (): void {
      this.expandedState = !this.expandedState;
    }
  }

</script>

<style lang="scss">
@import "@/styles/variables";
.collapsible-item {
  margin: 2px 0;
  display: flex;
  flex-direction: column;
  position: relative;

  &.active {
    flex: 1;
  }

  .item-container {
    padding: 2px 0;
    .item-title {
      display: flex;
      align-items: baseline;
      padding: 5px;
      font-weight: bold;
      cursor: pointer;
      background-color: $drilldown-header;
      div {
        padding: 5px;
      }
    }
  }
}

</style>
