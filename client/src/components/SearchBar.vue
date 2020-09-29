<template>
  <div class="search-bar-container">

  </div>
</template>

<script>

  export default {
    name: 'SearchBar',
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

.search-bar-container {
  position: relative;
  width: 100%;
  height: $secondary-bar-width;
  background-color: $secondary-bar-bg;
}

</style>
