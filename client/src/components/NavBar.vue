<template>
  <nav class="navbar navbar-expand-lg fixed-top">
    <a class="navbar-brand" href="#/">ASKE-E HMI</a>
    <div class="collapse navbar-collapse">
      <ul v-if="displayNav" class="navbar-nav">
        <li class="nav-item" :class="{ underlined: isCurrentView('docsCards', 'docsClusters') }">
          <a class="nav-link" href="#/knowledge/docsCards">Knowledge</a>
        </li>
        <li class="nav-item" :class="{ underlined: isCurrentView('graphs', 'graph') }">
          <a class="nav-link" href="#/graphs">Graphs</a>
        </li>
        <li class="nav-item" :class="{ underlined: isCurrentView('models', 'model', 'simulation', 'comparison') }">
          <a class="nav-link" href="#/models">Models</a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';

  @Component
  export default class NavBar extends Vue {
    get displayNav () : boolean {
      return this.isCurrentView('home', 'graphs', 'graph', 'models', 'model', 'simulation', 'comparison', 'docsCards', 'docsClusters');
    }

    get currentView (): string {
      return this.$route?.name;
    }

    /** Check if one of the views name passed as parameters is the current view. */
    isCurrentView (...views: string[]): boolean {
      return Array.from(views).includes(this.currentView);
    }
  }
</script>
