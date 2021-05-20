<template>
  <div class="view-container">
    <main>
      <a class="nav-view" href="#/knowledge/docsCards">
        <h3>Knowledge</h3>
        <p>Discover relevant documents and links to existing graphs and&nbsp;models.</p>
      </a>
      <a class="nav-view" href="#/graphs">
        <h3>Graphs</h3>
        <p>Extraction of relevant subgraphs and their link back to scientific&nbsp;knowledge.</p>
        <p>{{ nbGraphsModels }} Knowledgable Graphs</p>
      </a>
      <a class="nav-view" href="#/models">
        <h3>Models</h3>
        <p>Model understanding, comparison and&nbsp;simulation.</p>
        <p>{{ nbComputationalModels }} Computational Models</p>
      </a>
    </main>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Getter } from 'vuex-class';

  // -- DO NOT REMOVE
  // https://github.com/uncharted-aske/HMI/issues/208
  import { initializeLex } from '@/utils/LexUtil';
  initializeLex({ pills: [], onChange: () => null });
  // -- DO NOT REMOVE

  @Component
  export default class Home extends Vue {
    @Getter getNbGraphsModels;
    @Getter getNbComputationalModels;

    get nbGraphsModels (): number {
      return this.getNbGraphsModels;
    }

    get nbComputationalModels (): number {
      return this.getNbComputationalModels;
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

  main {
    --gap: 2rem;
    align-content: center;
    display: grid;
    grid-template-columns: 1fr repeat(3, minmax(20em, 25em)) 1fr;
    gap: var(--gap);
    height: 100%;
    justify-content: space-evenly;
    padding: var(--gap);
    width: 100%;
  }

  .nav-view {
    background-color: $bg-primary;
    outline: transparent solid 3px;
    border-radius: 3px;
    color: $text-color-light;
    padding: 1rem;
    text-decoration: none;

    &:first-of-type {
      grid-column-start: 2;
    }

    &:hover {
      outline-color: $nord13;
    }

    h3 {
      border-bottom: 2px solid;
      margin-bottom: 1em;
      padding-bottom: .5em;
      text-align: center;
    }

    h3 + p {
      font-style: italic;
    }
  }
</style>
