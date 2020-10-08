<template>
  <div id="app">
    <nav-bar />
    <router-view />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import NavBar from '@/components/NavBar.vue';

@Component({
  components: { NavBar },
})
  export default class App extends Vue {
  }
</script>

<style lang="scss">
@import 'bootstrap/dist/css/bootstrap.min';
@import "styles/aske";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: $navbar-outer-height;
}
</style>
