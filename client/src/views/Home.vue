<template>
  <div class="home-container">
    <action-column>
      <div slot="actions">
        <action-column-nav-bar :actions="actions" :currentAction="currentAction" @set-active="onSetActive" />
      </div>
      <div slot="panel" v-if="activePane">
        <left-side-panel @close-pane="onClose">
          <div slot="content">
            <facets-pane v-if="activePane === actions[0].paneId" />
          </div>
        </left-side-panel>
      </div> -->
    </action-column>
    <search-bar />
    <start-screen
        :open-section-header="`Models`"
        :recent-cards="models"
    />

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

  const MODELS = [
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test' },
    { id: 1, previewImageSrc: null, title: 'test', subtitle: 'test' },
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

    onSetActive (actionName: string): void {
      let activePane = '';
      if (actionName !== '') {
        activePane = this.actions.find(a => a.name === actionName).paneId;
      }
      this.activePane = activePane;
    }

    onClose ():void {
      this.activePane = '';
    }

  // public openView (view: string): void {
  //   this.$router.push({ name: view });
  // }
  }
</script>

<style lang="scss" scoped>
@import "../styles/variables";

.home-container {
    position:relative;
    width: 100vw;
    height: $content-full-height;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-flow: column wrap;
    .btn {
      background-color: transparent;
      color: $text-color;
      width: $secondary-bar-width;
      height: $secondary-bar-width;
      position: relative;
      border: 1px solid $border;
    }
  }
</style>
