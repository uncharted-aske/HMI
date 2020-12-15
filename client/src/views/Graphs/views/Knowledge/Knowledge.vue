<template>
  <div class="view-container">
    <left-side-panel @close-pane="onClosePane">
      <div slot="content">
        <facets-pane />
      </div>
    </left-side-panel>

    <div class="content">
      <div class="search-row">
        <search-bar />
      </div>
      <settings-bar>
        <div slot="counters">
          <counters :labels="['Total', 'Page']" :values="countersValues"/>
        </div>
        <div slot="settings">
          <settings />
        </div>
      </settings-bar>
      <start-screen
          :open-section-header="`Knowledge`"
          :cards="modelsCards"
          @open-card="onOpenCard"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter, Mutation } from 'vuex-class';

  import { CardInterface } from '@/views/Home/types/types';

  import ActionColumn from '@/components/ActionColumn.vue';
  import ActionColumnNavBar from '@/components/ActionColumnNavBar.vue';
  import SearchBar from '@/views/Home/components/SearchBar/SearchBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Settings from './Settings/Settings.vue';
  import Counters from '@/views/Graphs/components/Counters/Counters.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import FacetsPane from '@/views/Home/components/FacetsPane/FacetsPane.vue';
  import StartScreen from '@/views/Home/components/StartScreen/StartScreen.vue';

  // Screenshots
  import data from './example.json';

  const ACTIONS = [
    { name: 'Facets', icon: 'filter', paneId: 'facets' },
  ];

  const components = {
    ActionColumn,
    ActionColumnNavBar,
    SearchBar,
    Settings,
    SettingsBar,
    Counters,
    LeftSidePanel,
    FacetsPane,
    StartScreen,
  };

  @Component({ components })
  export default class Home extends Vue {
    activePane = '';
    actions: any = ACTIONS;
    dataLoaded = false;

    @Getter getFilters;
    @Getter getModelsList;
    @Mutation setSelectedModel;

    get countersValues (): Array<number> {
      return [data.total, data.page + 1];
    }

    get currentAction (): string {
      return this.activePane && this.actions.find(a => a.paneId === this.activePane).name;
    }

    get modelsCards (): CardInterface[] {
      return data.objects.map((item, index) => ({
        id: index,
        title: item.bibjson.title,
        subtitle: item.children[0].content,
        type: item.bibjson.type,
      }));
    }

    onOpenCard (card: CardInterface): void {
      const view = card.type === 'computational' ? 'epiView' : 'bioView';
      this.setSelectedModel(card.id);
      this.$router.push({ name: view });
    }

    onSetActivePane (actionName: string): void {
      let activePane = '';
      if (actionName !== '') {
        activePane = this.actions.find(a => a.name === actionName).paneId;
      }
      this.activePane = activePane;
    }

    onClosePane ():void {
      this.activePane = '';
    }
  }
</script>

<style lang="scss" scoped>
</style>
