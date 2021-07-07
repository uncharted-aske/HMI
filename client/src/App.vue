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

#app {
  background-color: var(--bg-body);
  font-family: Avenir, Helvetica, Arial, sans-serif;
  height: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
}

#app.hasNavBar {
  padding-top: var(--navbar-outer-height);
}
</style>
