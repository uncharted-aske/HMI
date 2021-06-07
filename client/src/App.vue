<template>
  <div id="app" :class="{ hasNavBar: displayNavBar }">
    <nav-bar v-if="displayNavBar" />
    <router-view />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import NavBar from '@/components/NavBar.vue';

  const components = { NavBar };

  @Component({ components })
  export default class App extends Vue {
    get displayNavBar (): boolean {
      // Hide the navbar on the homepage.
      return this.$route?.name !== 'home';
    }
  }
</script>

<style lang="scss">
@import '~bootstrap/dist/css/bootstrap.min';
@import "styles/aske";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: $bg-body;
  height: 100%;

  &.hasNavBar {
    padding-top: $navbar-outer-height;
  }
}
</style>
