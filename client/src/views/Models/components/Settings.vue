<template>
  <div class="settings-container">
    <!-- Modeling Framework -->
    <button
      class="btn btn-secondary"
      :disabled="!views.length"
      type="button"
      @click="toggleViews"
    >
      Modeling Framework
      <template v-if="views.length">:
        <span class="setting-name">{{ selectedViewName }}</span>
        <font-awesome-icon :icon="['fas', 'caret-down' ]" />
      </template>
    </button>
    <dropdown v-if="showDropdownViews" class="dropdown-settings view">
      <div slot="content" class="btn-group btn-group-sm">
        <button
          v-for="view in views" :key="view.id"
          class="btn btn-light"
          type="button"
          :class="{'active': view.id === selectedViewId}"
          @click="onViewSelection(view.id)"
        >
          {{ view.name }}
        </button>
      </div>
    </dropdown>

    <!-- Layouts -->
    <button
      class="btn btn-secondary"
      :disabled="!layouts.length"
      type="button"
      @click="toggleLayouts"
    >
      Layout
      <template v-if="layouts.length">:
        <span class="setting-name">{{ selectedLayoutName }}</span>
        <font-awesome-icon :icon="['fas', 'caret-down' ]" />
      </template>
    </button>
    <dropdown v-if="showDropdownLayouts" class="dropdown-settings layout">
      <div slot="content" class="btn-group btn-group-sm">
        <button
          v-for="layout in layouts" :key="layout.id"
          class="btn btn-light"
          type="button"
          :class="{'active': layout.id === selectedLayoutId}"
          @click="onLayoutSelection(layout.id)"
        >
          {{ layout.name }}
        </button>
      </div>
    </dropdown>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import { ViewInterface } from '@/types/types';
  import { GraphLayoutInterface } from '@/types/typesGraphs';

  import Dropdown from '@/components/Dropdown.vue';

  const components = {
    Dropdown,
  };
  @Component({ components })
  export default class Settings extends Vue {
    @Prop({ default: () => [] }) views: ViewInterface[];
    @Prop({ default: () => [] }) layouts: GraphLayoutInterface[];

    @Prop({ default: '' }) selectedViewId: string;
    @Prop({ default: '' }) selectedLayoutId: string;

    showDropdownViews: boolean = false;
    showDropdownLayouts: boolean = false;

    get selectedViewName (): string {
      return this.views.find(view => view.id === this.selectedViewId)?.name;
    }

    get selectedLayoutName (): string {
      return this.layouts.find(layout => layout.id === this.selectedLayoutId)?.name;
    }

    toggleViews (): void {
      this.showDropdownViews = !this.showDropdownViews;
    }

    toggleLayouts (): void {
      this.showDropdownLayouts = !this.showDropdownLayouts;
    }

    onViewSelection (viewId:string):void {
      this.$emit('view-change', viewId);
    }

    onLayoutSelection (layoutId:string):void {
      this.$emit('layout-change', layoutId);
    }

    runQuery (): void {
      this.$emit('run-query');
    }
  }
</script>

<style scoped>
.settings-container {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  position: relative;
}

.settings-container .setting-name {
  font-weight: bold;
}

.dropdown-settings {
  align-items: center;
  display: flex;
  height: var(--secondary-bar-width);
  padding: 10px;
  position: absolute;
  top: calc(var(--secondary-bar-width) - 10px);
}

.layout {
  right: 0px;
}

.view {
  left: 0px;
}
</style>
