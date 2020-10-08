<template>
  <div class="home-container">
    <action-column>
      <div slot="actions">
        <action-column-nav-bar :actions="actions" :current-action="currentAction" @set-active="onSetActive" />  
      </div>
    </action-column>
    <left-side-panel @close-pane="onClosePane" v-if="activePane">
      <div slot="content">
        <facets-pane v-if="activePane === actions[0].paneId" />
      </div>
    </left-side-panel>
   
    <div class="content">
      <search-bar />
      <start-screen
          :open-section-header="`Models`"
          :cards="models"
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
  import CardsList from '@/components/CardsList.vue';


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
    CardsList,
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
    }

    onClosePane ():void {
      this.activePane = '';
    }

    test() {
      this.activePane = 'facets';
    }
  }
</script>

<style lang="scss" scoped>
@import "../styles/variables";
.home-container {
  height: $content-full-height;
  display: flex;
  flex-flow: row nowrap;
  flex: 1;
  overflow: hidden;
  box-sizing: border-box;
  .content {
    flex: 1;
  }
}
</style>
