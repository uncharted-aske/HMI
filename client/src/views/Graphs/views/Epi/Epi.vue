<template>
  <div class="view-container">
    <left-side-panel :tabs="tabs" :activeTabId="activeTabId" @tab-click="onTabClick">
          <div slot="content">
            <metadata-pane v-if="activeTabId ===  'metadata'" :metadata="selectedModel.metadata"/>
            <facets-pane v-if="activeTabId === 'facets'" />
          </div>
    </left-side-panel>
    <div class="content">
      <search-bar />
      <settings-bar>
        <div slot="counters">
          <counters :model-name="selectedModel.metadata.name" :node-count="nodeCount" :edge-count="edgeCount"/>
        </div>
        <div slot="settings">
          <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/>
        </div>
      </settings-bar>
      <epi-graph v-if="selectedModel" :graph="selectedGraph" @node-click="onNodeClick"/>
    </div>
    <drilldown-panel @close-pane="onCloseDrilldownPanel" :is-open="isOpenDrilldown" :pane-title="drilldownPaneTitle" :pane-subtitle="drilldownPaneSubtitle" >
      <div slot="content">
        <drilldown-metadata-pane :metadata="drilldownMetadata"/>
      </div>
    </drilldown-panel>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter } from 'vuex-class';

  import { TabInterface, ViewInterface, ModelInterface, ModelComponentMetadataInterface } from '@/types/types';
  import { GraphInterface, GraphNodeInterface } from '@/views/Graphs/types/types';

  import SearchBar from './components/SearchBar/SearchBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Counters from '@/views/Graphs/components/Counters/Counters.vue';
  import Settings from '@/views/Graphs/components/Settings/Settings.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPane from '@/views/Graphs/components/MetadataPane/MetadataPane.vue';
  import FacetsPane from './components/FacetsPane/FacetsPane.vue';
  import EpiGraph from './components/EpiGraph/EpiGraph.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import DrilldownMetadataPane from '@/views/Graphs/components/DrilldownMetadataPanel/DrilldownMetadataPane.vue';

  const TABS: TabInterface[] = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
    { name: 'Metadata', icon: 'info', id: 'metadata' },
  ];

  const VIEWS: ViewInterface[] = [
    { name: 'Summary', id: 'summary' },
    { name: 'Causal', id: 'causal' },
    { name: 'Functional', id: 'functional' },
  ];

  const components = {
    SearchBar,
    SettingsBar,
    Counters,
    Settings,
    LeftSidePanel,
    MetadataPane,
    FacetsPane,
    EpiGraph,
    DrilldownPanel,
    DrilldownMetadataPane,
  };

  @Component({ components })
  export default class EpiView extends Vue {
    tabs: TabInterface[] = TABS;
    activeTabId: string = 'metadata';
    views: ViewInterface[] = VIEWS;
    selectedViewId = 'causal';
    isOpenDrilldown = false;
    drilldownPaneTitle = '';
    drilldownPaneSubtitle = '';
    drilldownMetadata: ModelComponentMetadataInterface = null;

    @Getter getSelectedModelId;
    @Getter getModelsList;

    get selectedModel (): ModelInterface {
      const modelsList = this.getModelsList;
      return modelsList.find(model => model.id === this.getSelectedModelId);
    }

    get selectedGraph (): GraphInterface {
      return this.selectedViewId === 'causal' ? this.selectedModel.graph.abstract : this.selectedModel.graph.detailed;
    }

    get nodeCount (): number {
      return this.selectedGraph && this.selectedGraph.nodes.length;
    }

    get edgeCount (): number {
      return this.selectedGraph && this.selectedGraph.edges.length;
    }

    onTabClick (tabId: string): void {
      this.activeTabId = tabId;
    }

    onCloseDrilldownPanel ():void {
      this.isOpenDrilldown = false;
      this.drilldownPaneTitle = '';
      this.drilldownMetadata = null;
    }

    onSetView (viewId: string): void {
      this.selectedViewId = viewId;
    }

    onNodeClick (node: GraphNodeInterface): void {
      this.isOpenDrilldown = true;
      this.drilldownPaneTitle = node.metadata.units ? node.label + ' (' + node.metadata.units + ')' : node.label;
      this.drilldownPaneSubtitle = node.type;
      this.drilldownMetadata = node.metadata;
    }
  }
</script>

<style lang="scss" scoped>

</style>
