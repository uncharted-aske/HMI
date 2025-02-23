<template>
  <!-- <div class="view-container"> -->
  <main>
    <h1>ASKE-E HMI</h1>
    <nav>
      <section>
        <p>Discover relevant documents and links to existing graphs and&nbsp;models.</p>
        <a class="nav-view" href="#/knowledge/docsCards">
          <h2>Knowledge</h2>
          <p>Documents <strong>{{ nbKnowledge }}</strong></p>
        </a>
      </section>
      <section>
        <p>Extraction of relevant subgraphs and their link back to scientific&nbsp;knowledge.</p>
        <a class="nav-view" href="#/graphs">
          <h2>Graphs</h2>
          <p>Graphs <strong>{{ nbGraphsModels }}</strong></p>
        </a>
      </section>
      <section>
        <p>Model understanding, comparison, and&nbsp;simulation.</p>
        <a class="nav-view" href="#/models">
          <h2>Models</h2>
          <p>Computational Models <strong>{{ nbComputationalModels }}</strong></p>
        </a>
      </section>
    </nav>
  </main>
  <!-- </div> -->
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Getter } from 'vuex-class';

  import { CosmosSearchInterface } from '@/types/typesCosmos';
  import { cosmosSearch } from '@/services/CosmosFetchService';

  import { shorterNb } from '@/utils/NumberUtil';

  // -- DO NOT REMOVE
  // https://github.com/uncharted-aske/HMI/issues/208
  import { initializeLex } from '@/utils/LexUtil';
  initializeLex({ pills: [], onChange: () => null });
  // -- DO NOT REMOVE

  /** Display number for the card and avoid the 0 while loading. */
  function displayNb (number: number): string {
    return number < 1 ? '-' : shorterNb(number);
  }

  @Component
  export default class Home extends Vue {
    cosmos: CosmosSearchInterface = null;

    @Getter getCountComputationalModels;
    @Getter getCountKnowledgeGraphs;

    mounted (): void {
      this.fetchCosmos();
    }

    async fetchCosmos (): Promise<void> {
      try {
        this.cosmos = await cosmosSearch(null);
      } catch (e) {
        throw Error(e);
      }
    }

    get nbGraphsModels (): string {
      return displayNb(this.getCountKnowledgeGraphs);
    }

    get nbComputationalModels (): string {
      return displayNb(this.getCountComputationalModels);
    }

    get nbKnowledge (): string {
      return displayNb(this.cosmos?.total ?? 0);
    }
  }
</script>

<style scoped>
  main {
    --gap: 2rem;
    align-content: center;
    color: var(--text-color-light);
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    height: 100%;
    justify-content: center;
    padding: var(--gap);
  }

  h1 {
    text-align: center;
  }

  nav {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--gap);
  }

  nav section {
    --gap: 1rem;
    display: flex;
    flex-direction: column;
    gap: var(--gap);
  }

  nav section p:first-of-type {
    flex-shrink: 0;
    min-height: 3rem;
  }

  .nav-view {
    --radius: 3px;
    background-color: var(--bg-primary);
    color: inherit;
    display: block;
    flex-grow: 1;
    border-radius: var(--radius);
    text-decoration: none;
    will-change: transform;
  }

  .nav-view:hover {
    cursor: pointer;
    transform: translateY(-2px);
  }

  .nav-view > * {
    padding: var(--gap);
  }

  .nav-view p:last-of-type {
    margin-bottom: 0;
  }

  .nav-view strong {
    display: block;
    font-size: 4rem;
    line-height: 1;
    margin-top: .25em;
  }

  .nav-view h2 {
    background-color: var(--bg-secondary);
    border-radius: var(--radius) var(--radius) 0 0;
    font-size: 1.5em;
    font-weight: normal;
    line-height: 1;
    margin: 0;
  }
</style>
