<template>
  <aside class="legend-panel" :class="{ 'open' : isOpen }">
    <header>
      <button type="button" @click="toggleLegend()">
        Legend
        <font-awesome-icon :icon="['fas', toggleIcon ]" />
      </button>
    </header>
    <div class="legends">
      <slot />
    </div>
  </aside>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  @Component
  export default class LegendPanel extends Vue {
    @Prop({ default: false }) open: boolean;
    isOpen: boolean = false;

    mounted (): void {
      this.isOpen = Boolean(this.open);
    }

    get toggleIcon (): string {
      return this.isOpen ? 'angle-double-down' : 'angle-double-up';
    }

    toggleLegend (): void {
      this.isOpen = !this.isOpen;
    }
  }
</script>

<style scoped>
  .legend-panel {
    --background-colour: white;
    background-color: var(--background-colour);
    border: var(--border);
    border-radius: 5px;
    bottom: .5em;
    left: 1em;
    overflow: hidden;
    position: absolute;
  }

  header {
    padding: .33em 2em;
    text-align: center;
  }

  header button {
    background-color: var(--background-colour);
    border: none;
    font-size: .85em;
    font-weight: bold;
    line-height: 1rem;
    outline: none;
    text-transform: uppercase;
  }

  .legends {
    display: flex;
    flex-direction: row;
    gap: 2em;
  }

  /* isOpen */
  .legends {
    max-height: 0;
    max-width: 0;
    padding: 0;
    transition: max-height 100ms, max-width 100ms, padding 50ms;
    will-change: max-height, max-width, padding;
  }
  .legend-panel.open .legends {
    max-height: 100vh;
    max-width: 100vw;
    padding: 1em;
    transition: max-height 500ms, max-width 500ms, padding 50ms;
  }
</style>
