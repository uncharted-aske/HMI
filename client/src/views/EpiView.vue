<template>
  <div class="view-container">
    <action-column>
      <div slot="actions">
        <action-column-nav-bar :actions="actions" :currentAction="currentAction" @set-active-pane="onSetActive" />
      </div>
    </action-column>
    <left-side-panel @close-pane="onClose"  v-if="activePane">
          <div slot="content">
            <facets-pane v-if="activePane === actions[0].paneId" />
            <metadata-pane v-if="activePane ===  actions[1].paneId && selectedModel" :metadata="selectedModel.metadata"/>
          </div>
    </left-side-panel>
    <div class="content">
      <search-bar />
      <counters />
      <epi-graph v-if="selectedModel" :graph="selectedModel.graph"/>
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter } from 'vuex-class';

  import { ActionColumnInterface, ModelMetadataInterface } from '../types/types';

  import ActionColumn from '@/components/ActionColumn.vue';
  import ActionColumnNavBar from '@/components/ActionColumnNavBar.vue';
  import SearchBar from '@/components/SearchBar.vue';
  import Counters from '@/components/Counters.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPane from '@/components/MetadataPane.vue';
  import FacetsPane from '@/components/FacetsPane.vue';
  import EpiGraph from '@/components/EpiGraph.vue';

  const ACTIONS = [
    { name: 'Facets', icon: 'filter', paneId: 'facets' },
    { name: 'Metadata', icon: 'info', paneId: 'metadata' },
  ];

  const components = {
    ActionColumn,
    ActionColumnNavBar,
    SearchBar,
    Counters,
    LeftSidePanel,
    MetadataPane,
    FacetsPane,
    EpiGraph,
  };

  @Component({ components })
  export default class EpiView extends Vue {
    activePane = '';
    actions: ActionColumnInterface[] = ACTIONS;

    @Getter getSelectedModelId;
    @Getter getModelsList;

    get selectedModel (): ModelMetadataInterface {
      const modelsList = this.getModelsList;
      return modelsList.find(model => model.id === this.getSelectedModelId);
    }

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
  }
</script>

<style lang="scss" scoped>

</style>
