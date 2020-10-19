<template>
  <div class="view-container">
    <action-column>
      <div slot="actions">
        <action-column-nav-bar :actions="actions" :current-action="currentAction" @set-active-pane="onSetActivePane" />
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

  import { ActionColumnInterface, CardInterface } from '../types/types';

  import ActionColumn from '@/components/ActionColumn.vue';
  import ActionColumnNavBar from '@/components/ActionColumnNavBar.vue';
  import SearchBar from '@/components/SearchBar.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import FacetsPane from '@/components/FacetsPane.vue';
  import StartScreen from '@/components/StartScreen.vue';

  // Screenshots
  import CHIMEScreenshot from '@/assets/img/CHIME.png';
  import SIRScreenshot from '@/assets/img/SIR.png';
  import DoubleEpiScreenshot from '@/assets/img/DoubleEpi.png';

  const ACTIONS = [
    { name: 'Facets', icon: 'filter', paneId: 'facets' },
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
    actions: ActionColumnInterface[] = ACTIONS;

    @Getter getModelsList; // FIXME: We need to explore another options for this to avoid using decorators.
    @Mutation setSelectedModel;

    get currentAction (): string {
      return this.activePane && this.actions.find(a => a.paneId === this.activePane).name;
    }

    get modelsCards (): CardInterface[] {
      const modelsList = this.getModelsList;
      const modelsCards = modelsList.map(model => {
        let previewImageSrc = null;
        switch (model.id) {
        case 1:
            previewImageSrc = CHIMEScreenshot;
            break;
          case 2:
            previewImageSrc = SIRScreenshot;
            break;
          case 3:
            previewImageSrc = DoubleEpiScreenshot;
            break;
          default:
            previewImageSrc = null;
        }
        return Object.assign({}, model, { previewImageSrc, title: model.metadata.name, subtitle: model.metadata.source });
      });
      return modelsCards;
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
