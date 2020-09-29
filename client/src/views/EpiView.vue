<template>
  <div class="epi-view-container">
    <action-column>
      <div slot="actions">
        <button
        class="btn btn-secondary">
        <font-awesome-icon :icon="['fas', 'filter']" />
        </button>  
        <button
        class="btn btn-secondary">
        <font-awesome-icon :icon="['fas', 'info']" />
        </button>  
    </div>
    </action-column>  
    <search-bar />
  </div>
</template>

<script>
  import ActionColumn from '@/components/ActionColumn.vue';
  import SearchBar from '@/components/SearchBar.vue';

  export default {
    name: 'EpiView',
    components: {
      ActionColumn,
      SearchBar,
    },
    data: () => ({

    }),
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
