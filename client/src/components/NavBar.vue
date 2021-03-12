<template>
<nav class="navbar navbar-expand-lg fixed-top">
  <a class="navbar-brand" href="#/">ASKE-E HMI</a>
  <div class="collapse navbar-collapse">
    <ul class="navbar-nav">
      <li
        v-if="displayNav"
        class="nav-item"
        :class="{underlined: currentView === 'docsCards' || currentView === 'docsClusters'}"
      >
        <a class="nav-link" href="#/knowledge/docsCards">Knowledge</a>
      </li>
      <li
        v-if="displayNav"
        class="nav-item"
        :class="{underlined: currentView === 'epi' || currentView === 'bio' || currentView === 'comparison' || currentView === 'home'}"
      >
        <a class="nav-link" href="#/">Models</a>
      </li>
    </ul>
  </div>
</nav>

</template>

<script lang="ts">
  import Vue from 'vue';
  import { Getter } from 'vuex-class';

  export default class NavBar extends Vue {
    @Getter getSelectedModelIds;

    get displayNav () : boolean {
      const { currentView } = this;
      return currentView === 'home' ||
        currentView === 'bio' ||
        currentView === 'epi' ||
        currentView === 'comparison' ||
        currentView === 'docsCards' ||
        currentView === 'docsClusters';
    }

    get currentView () : string {
      return this.$route && this.$route.name;
    }
  }
</script>

<style lang="scss">
</style>
