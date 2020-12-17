<template>
<nav class="navbar navbar-expand-lg fixed-top navbar-dark bg-dark">
  <a class="navbar-brand" href="#/">Uncharted HMI</a>
  <div class="collapse navbar-collapse">
    <ul class="navbar-nav">
      <li
        v-if="displayNav"
        class="nav-item"
        :class="{underlined: currentView === 'epiView' || currentView === 'bioView' || currentView === 'home'}"
      >
        <a class="nav-link" href="#/epiView">Models</a>
      </li>
      <li
        v-if="displayNav"
        class="nav-item"
        :class="{underlined: currentView === 'knowledge'}"
      >
        <a class="nav-link" href="#/knowledge">Knowledge</a>
      </li>
    </ul>
  </div>
</nav>

</template>

<script lang="ts">
  import Vue from 'vue';

  export default class NavBar extends Vue {
    get displayNav () : boolean {
      const { currentView } = this;
      return currentView === 'home' ||
        currentView === 'bioView' ||
        currentView === 'epiView' ||
        currentView === 'knowledge';
    }

    get currentView () : string {
      return this.$route && this.$route.name;
    }
  }
</script>
