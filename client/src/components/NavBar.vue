<template>
<nav class="navbar navbar-expand-lg fixed-top">
  <a class="navbar-brand" href="#/">ASKE-E HMI</a>
  <div class="collapse navbar-collapse">
    <ul class="navbar-nav">
      <li
        v-if="displayNav"
        class="nav-item"
        :class="{underlined: currentView === 'knowledge' || currentView === 'knowledgeDocsClusters'}"
      >
        <a class="nav-link" href="#/knowledge">Knowledge</a>
      </li>
      <li
        v-if="displayNav"
        class="nav-item"
        :class="{underlined: currentView === 'epiView' || currentView === 'bioView' || currentView === 'home'}"
      >
        <a class="nav-link" href="#/">Models</a>
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
        currentView === 'knowledge' ||
        currentView === 'knowledgeDocsClusters';
    }

    get currentView () : string {
      return this.$route && this.$route.name;
    }
  }
</script>

<style lang="scss">
</style>
