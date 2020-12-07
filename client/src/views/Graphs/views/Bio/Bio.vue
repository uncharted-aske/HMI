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
            <metadata-pane v-if="activePane ===  actions[1].paneId && selectedModel" :metadata="selectedModel.metadata" />
          </div>
        </left-side-panel>
    <div class="content">
      <search-bar />
      <counters :model-name="selectedModel.metadata.name" :node-count="nodeCount" :edge-count="edgeCount"/>
      <sigma-grapher />
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter } from 'vuex-class';

  import { TabInterface, ModelInterface } from '@/types/types';

  import ActionColumn from '@/components/ActionColumn.vue';
  import ActionColumnNavBar from '@/components/ActionColumnNavBar.vue';
  import SearchBar from './components/SearchBar/SearchBar.vue';
  import Counters from '@/views/Graphs/components/Counters/Counters.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPane from '@/views/Graphs/components/MetadataPane/MetadataPane.vue';
  import FacetsPane from './components/FacetsPane/FacetsPane.vue';

  const ACTIONS = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
    { name: 'Metadata', icon: 'info', id: 'metadata' },
  ];

  const components = {
    ActionColumn,
    ActionColumnNavBar,
    SearchBar,
    Counters,
    LeftSidePanel,
    MetadataPane,
    FacetsPane,
  };

  @Component({ components })
  export default class BioView extends Vue {
    activePane = '';
    actions: TabInterface[] = ACTIONS;

    @Getter getSelectedModelId;
    @Getter getModelsList;

    get currentAction (): string {
      return this.activePane && this.actions.find(a => a.id === this.activePane).name;
    }

    get selectedModel (): ModelInterface {
      const modelsList = this.getModelsList;
      return modelsList.find(model => model.id === this.getSelectedModelId);
    }

    get selectedGraph (): any {
      return this.selectedModel.graph;
    }

    get nodeCount (): number {
      return this.selectedGraph && this.selectedGraph.nodes.length;
    }

    get edgeCount (): number {
      return this.selectedGraph && this.selectedGraph.edges.length;
    }

    onSetActive (actionName: string): void {
      let activePane = '';
      if (actionName !== '') {
        activePane = this.actions.find(a => a.name === actionName).id;
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
