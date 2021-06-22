<template>
  <div class="settings-container">
    <button
      class="btn btn-secondary"
      :disabled="!views.length"
      type="button"
      @click="toggleViews"
    >
      Modeling Framework
      <template v-if="views.length">:
        <span class="view-name">{{ selectedViewName }}</span>
        <font-awesome-icon :icon="['fas', 'caret-down' ]" />
      </template>
    </button>
    <dropdown v-if="showDropdownViews" class="dropdown-settings">
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
    <button type="button" class="btn btn-secondary">Layouts</button>
    <button type="button" class="btn btn-secondary" disabled>Settings</button>
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

    get selectedViewName (): string {
      return this.views.find(view => view.id === this.selectedViewId)?.name;
    }

    toggleViews (): void {
      this.showDropdownViews = !this.showDropdownViews;
    }

    onViewSelection (viewId:string):void {
      this.$emit('view-change', viewId);
    }

    runQuery (): void {
      this.$emit('run-query');
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.settings-container {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  position: relative;

  .view-name {
    font-weight: bold;
  }
}

.dropdown-settings {
  align-items: center;
  display: flex;
  height: calc(#{$secondary-bar-width});
  padding: 10px;
  position: absolute;
  top: calc(#{$secondary-bar-width} - 15px);
}
</style>
