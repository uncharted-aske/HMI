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
        TEST
      </button>
    </div>
 
    <!-- <div
      v-if="tabs.length > 1"
      class="tab-panel row no-gutter flex flex-wrap"
    >
      <ul
        class="nav nav-tabs flex"
        role="tablist">
        <li
          v-for="tab in tabs"
          :key="tab.id"
          class="nav-link flex-shrink-0"
          :class="{active: activeTabId === tab.id}">
          <a
            v-tooltip.top-center="tab.name"
            href="#"
            @click.stop.prevent="onTabClick(tab.id)">
            <i
              v-if="tab.icon !== undefined"
              class="fa fa-fw"
              :class="getClassObject(tab.icon)"
            />
          </a>
        </li>
      </ul>
    </div> -->
    <div class="panel-header">
        TEST
      <!-- <h5>{{ paneTitle }}</h5>
      <slot name="action" /> -->
    </div>
    <div class="panel-content">
      TEST
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
  export default class LeftSidePanel extends Vue {
    // @Prop({ default: false })
    isOpen: boolean = true;

    // @Prop({ default: '' })
    // paneTitle: string;

    togglePanel(): void {
        this.isOpen = !this.isOpen;
    }

    // onClose (): void {
    //   this.$emit('close-pane');
    // }
  }
</script>


<style lang="scss" scoped>
@import "@/styles/variables";

.left-side-panel-container {
  width: 25vw;
  height: $content-full-height;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  box-sizing: border-box;
  z-index: map-get($z-index-order, side-panel);

  &.closed {
    width: 0vw;
  }
}

.navigation-control {
  width: 20px;
  height: 50px;
  position: absolute;
  right: -1vw;
  bottom: 50vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  .btn {
    padding: 5px;
    box-shadow: 0 -1px 0 #e5e5e5, 0 0 2px rgba(0,0,0,.12), 0 2px 4px rgba(0,0,0,.24);
  }
}


</style>
