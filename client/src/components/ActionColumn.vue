<template>
  <div class="action-column-container">
     <button
          class="btn btn-secondary"
        >
          
        </button>   
         <button
          class="btn btn-secondary"
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
  background-color: #ECEFF1;
    & > .btn {
    background-color: transparent;
    width: $action-bar-width;
    height: $action-bar-width;
    position: relative;
    border: 1px solid $border;
    &.active {
      background-color: #ccc;
    }
  }
}

</style>
