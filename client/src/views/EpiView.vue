<template>
  <div class="epi-view-container">
    <action-column />
  </div>
</template>

<script>
  import ActionColumn from '@/components/ActionColumn.vue';

  export default {
    name: 'EpiView',
    components: {
      ActionColumn,

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
    border: 1px solid gray;
  }

</style>
