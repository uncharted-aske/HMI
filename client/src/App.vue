<template>
  <div id="app">
    <nav-bar></nav-bar>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import NavBar from 'components/NavBar.vue';

  const components = { NavBar };

  @Component({ components })
  export default class App extends Vue {
  }
</script>

<style lang="scss">
@import '~bootstrap/dist/css/bootstrap.min';
@import "styles/aske";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: $navbar-outer-height;
  background-color: $bg-body;
}
</style>
