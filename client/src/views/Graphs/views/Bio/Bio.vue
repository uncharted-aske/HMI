<template>
  <div class="view-container">
    <left-side-panel :tabs="tabs" :activeTabId="activeTabId" @tab-click="onTabClick">
        <div slot="content">
            <metadata-pane v-if="activeTabId ===  'metadata' && selectedModel" :metadata="selectedModel.metadata" />
            <facets-pane v-if="activeTabId === 'facets'" />
        </div>
    </left-side-panel>
    <div class="content">
      <search-bar />
      <settings-bar>
        <div slot="left">
          <counters :model-name="selectedModel.metadata.name"/>
        </div>
        <div slot="right">
          <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/>
        </div>
      </settings-bar>
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter } from 'vuex-class';

  import { TabInterface, ViewInterface, ModelInterface } from '@/types/types';

  import SearchBar from './components/SearchBar/SearchBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Counters from '@/views/Graphs/components/Counters/Counters.vue';
  import Settings from '@/views/Graphs/components/Settings/Settings.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPane from '@/views/Graphs/components/MetadataPane/MetadataPane.vue';
  import FacetsPane from './components/FacetsPane/FacetsPane.vue';

  const TABS: TabInterface[] = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
    { name: 'Metadata', icon: 'info', id: 'metadata' },
  ];

  const VIEWS: ViewInterface[] = [
    { name: 'Ontological', id: 'ontological' },
    { name: 'Clustered', id: 'clustered' },
  ];

  const components = {
    SearchBar,
    SettingsBar,
    Counters,
    Settings,
    LeftSidePanel,
    MetadataPane,
    FacetsPane,
  };

  @Component({ components })
  export default class BioView extends Vue {
    tabs: TabInterface[] = TABS;
    activeTabId: string = 'metadata';
    views: ViewInterface[] = VIEWS;
    selectedViewId = 'ontological';

    @Getter getSelectedModelIds;
    @Getter getModelsList;

    get selectedModel (): ModelInterface {
      const modelsList = this.getModelsList;
      return modelsList.find(model => model.id === (this.getSelectedModelIds && this.getSelectedModelIds[0]));
    }

    // get selectedGraph (): any {
    //   return this.selectedModel.graph;
    // }

    // get nodeCount (): number {
    //   return this.selectedGraph && this.selectedGraph.nodes.length;
    // }

    // get edgeCount (): number {
    //   return this.selectedGraph && this.selectedGraph.edges.length;
    // }

    onTabClick (tabId: string): void {
      this.activeTabId = tabId;
    }

    onSetView (viewId: string): void {
      this.selectedViewId = viewId;
    }
  }
</script>

<style lang="scss" scoped>
</style>
