<template>
  <div class="action-column-container">
    

  </div>
</template>

<script>

  export default {
    name: 'ActionColumn',
    components: {
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
  width: $action-bar-width;
  height: $content-full-height;
  background-color: $background-secondary;
}

</style>
