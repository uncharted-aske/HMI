<template>
  <div class="search-bar-container"></div>
</template>

<script lang="ts">

  import Vue from 'vue';
  import Component from 'vue-class-component';

  @Component
  export default class SearchBar extends Vue {
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.search-bar-container {
  height: $secondary-bar-width;
  background-color: $secondary-bar-bg;
  border: 1px solid rgba(207, 216, 220, .5);
}

</style>
