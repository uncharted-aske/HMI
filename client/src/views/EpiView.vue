<template>
  <div class="epi-view-container">
    <action-column />
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
      SearchBar
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
  }

</style>
