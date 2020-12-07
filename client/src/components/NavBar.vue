<template>
<nav class="navbar navbar-expand-lg fixed-top navbar-dark bg-dark">
  <a class="navbar-brand" href="#/">Uncharted HMI</a>
  <div class="collapse navbar-collapse">
    <ul class="navbar-nav">
      <li class="nav-item"  :class="{underlined: currentView === 'home' || currentView === 'epiView' || currentView === 'bioView'}">
        <a class="nav-link" href="#">Models</a>
      </li>
    </ul>
  </div>
</nav>

</template>

<script lang="ts">
  import Vue from 'vue';

  export default class NavBar extends Vue {
    get currentView () : string {
      return this.$route && this.$route.name;
    }
  }
</script>
