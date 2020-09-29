<template>
  <div class="action-column-container">
    <slot name="actions" />
    <left-side-panel />
  </div>
</template>

<script>

  import LeftSidePanel from '@/components/LeftSidePanel.vue';

  export default {
    name: 'ActionColumn',
    components: {
      LeftSidePanel,
    },
    data: () => ({
    }),
    methods: {

    },
  };
</script>

<style lang="scss" scoped>
@import "../styles/variables";

.action-column-container {
  position: relative;
  width: $secondary-bar-width;
  height: $content-full-height;
  background-color: $secondary-bar-bg;
    & > .btn {
    background-color: transparent;
    width: $secondary-bar-width;
    height: $secondary-bar-width;
    position: relative;
    border: 1px solid $border;
    &.active {
      background-color: #ccc;
    }
  }
}

</style>
