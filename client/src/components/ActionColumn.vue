<template>
  <div class="action-column-container">
     <button
          class="btn btn-default"
        >
          
        </button>   
         <button
          class="btn"
        >
          
        </button>     

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
    & > .btn {
    background-color: transparent;
    width: $action-bar-width;
    height: $action-bar-width;
    position: relative;
    border: 1px solid $border;
  }
}

</style>
