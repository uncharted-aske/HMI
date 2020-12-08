<template>
  <div class="settings-container">
    <button type="button" class="btn btn-secondary mr-1" @click="toggleViews">
      Views:
      <span class="view-name">{{views[selectedViewId].name}} </span>
      <font-awesome-icon :icon="['fas', 'caret-down' ]" />
    </button>
    <dropdown v-if="showDropdownViews" class="dropdown-settings">
      <div slot="content">
        <div class="btn-group btn-group-sm"  v-for="view in views" :key="view.id">
          <!-- Disabled visual summary temporarily -->
          <button 
          type="button" 
          class="btn btn-light" 
          :class="{'active': view.id === selectedViewId}" 
          :disabled="view.id === 0" 
          @click="onViewSelection(view.id)" >
          {{view.name}}
          </button>
        </div>
      </div>
    </dropdown>
    <button type="button" class="btn btn-secondary mr-1" disabled>Layouts</button>
    <button type="button" class="btn btn-secondary mr-1" disabled>Settings</button>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import { ViewInterface } from '@/types/types';

  import Dropdown from '@/components/Dropdown.vue';

  const components = {
    Dropdown,
  };
  @Component({ components })
  export default class Settings extends Vue {
    @Prop({ default: [] })
    views: ViewInterface;

    @Prop({ default: 1 })
    selectedViewId: number;

    showDropdownViews: boolean = false;

    toggleViews (): void {
      this.showDropdownViews = !this.showDropdownViews;
    }

    onViewSelection (viewId:number):void {
      this.$emit('view-change', viewId);
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.settings-container {
  display: flex;
  align-items: center;
  padding:5px;
  .btn {
    display: flex;
    align-items: center;
    height: calc(#{$secondary-bar-width} - 20px);
    .view-name {
      font-weight: bold;
      margin: 5px;
    }
  }
}

.dropdown-settings {
  display: flex;
  align-items: center;
  position: absolute;
  top: calc(#{$navbar-outer-height} * 2.5);
  right: 110px;
  height: calc(#{$secondary-bar-width});
  padding: 10px;
}

</style>
