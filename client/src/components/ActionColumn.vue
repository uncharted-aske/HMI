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
