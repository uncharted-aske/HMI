<template>
  <div class="action-column-container">
    <slot name="actions" />
    <slot name="panel" />
  </div>
</template>

<script>


  export default {
    name: 'ActionColumn',
  };
</script>

<style lang="scss" scoped>
@import "../styles/variables";

.action-column-container {
  position: relative;
  width: $secondary-bar-width;
  height: $content-full-height;
}

</style>
