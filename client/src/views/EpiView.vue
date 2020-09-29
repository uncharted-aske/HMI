<template>
  <div class="epi-view-container">
    <action-column>
      <div slot="actions">
        <button
        class="btn btn-secondary" @click="onClick">
        <font-awesome-icon :icon="['fas', 'filter']" />
        </button>
        <button
        class="btn btn-secondary">
        <font-awesome-icon :icon="['fas', 'info']" @click="onClick"/>
        </button>
      </div>
      <div slot="panel" v-if="showLeftSidePanel">
        <left-side-panel>
          <div slot="content">
            
          </div>  
        </left-side-panel>  
      </div>  
    </action-column>
    <search-bar />
  </div>
</template>

<script>
  import ActionColumn from '@/components/ActionColumn.vue';
  import SearchBar from '@/components/SearchBar.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';

  export default {
    name: 'EpiView',
    components: {
      ActionColumn,
      SearchBar,
      LeftSidePanel,
    },
    data: () => ({
      activePane: '',
      showLeftSidePanel: false,
    }),
    methods: {
      onClick() {
        this.showLeftSidePanel = !this.showLeftSidePanel;
      },
    },
  };
</script>

<style lang="scss" scoped>
@import "../styles/variables";

  .epi-view-container {
    height: $content-full-height;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    .btn {
      background-color: transparent;
      color: $text-color;
      width: $secondary-bar-width;
      height: $secondary-bar-width;
      position: relative;
      border: 1px solid $border;
    }
  }

</style>
