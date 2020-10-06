<template>
  <div class="home-container">
    <action-column>
      <div slot="actions">
      </div>
    </action-column>
    <left-side-panel @close-pane="onClose" v-if="activePane">
      <div slot="content">
        <facets-pane v-if="activePane === actions[0].paneId" />
      </div>
    </left-side-panel>
    <div class="content">
      <search-bar />
      <start-screen
          :open-section-header="`Models`"
          :recent-cards="models"
      /> 
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';

  import ActionColumn from '@/components/ActionColumn.vue';
  import ActionColumnNavBar from '@/components/ActionColumnNavBar.vue';
  import SearchBar from '@/components/SearchBar.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import FacetsPane from '@/components/FacetsPane.vue';
  import StartScreen from '@/components/StartScreen.vue';

  const ACTIONS = [
    { name: 'Facets', icon: 'filter', paneId: 'facets' },
  ];

  // Just for test purposes
  const MODELS = [
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test', type: 'computational' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test', type: 'qualitative' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test', type: 'computational' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test', type: 'computational' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test', type: 'computational' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test', type: 'computational' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test', type: 'computational' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test', type: 'computational' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test', type: 'computational' },
  ];

  const components = {
    ActionColumn,
    ActionColumnNavBar,
    SearchBar,
    LeftSidePanel,
    FacetsPane,
    StartScreen,
  };

  @Component({ components })
  export default class Home extends Vue {
    activePane = '';
    actions = ACTIONS;
    models = MODELS;

    get currentAction (): string {
      return this.activePane && this.actions.find(a => a.paneId === this.activePane).name;
    }

    onOpenCard (card: Record<string, unknown>): void {
      const view = card.type === 'computational' ? 'epiView' : 'bioView';
      this.$router.push({ name: view });
    }

    onSetActive (actionName: string): void {
      let activePane = '';
      if (actionName !== '') {
        activePane = this.actions.find(a => a.name === actionName).paneId;
      }
      this.activePane = activePane;
      console.log(this.activePane);
    }

    onClosePane ():void {
      this.activePane = '';
    }
  }
</script>

<style lang="scss" scoped>
@import "../styles/variables";
.home-container {
    position:relative;
    height: $content-full-height;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-flow: row nowrap;
    .btn {
      background-color: transparent;
      color: $text-color;
      width: $secondary-bar-width;
      height: $secondary-bar-width;
      position: relative;
      border: 1px solid $border;
    }
    .content {
      flex-grow: 1;
    }
}
</style>
