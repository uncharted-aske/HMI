<template>
  <div class="view-container">
    <!-- <left-side-panel :tabs="tabs" :activeTabId="activeTabId" @tab-click="onTabClick">
          <div slot="content">
            <metadata-pane v-if="activeTabId ===  'metadata'" :metadata="selectedModel.metadata"/>
            <facets-pane v-if="activeTabId === 'facets'" />
          </div>
    </left-side-panel> -->
    <div class="search-row">
      <search-bar />
    </div>
    <resizable-divider :left="true" :right="isSplitView">
      <div slot="content-left" class="content global">
        <settings-bar>
          <div slot="counters">
            <counters :model-name="getModelsList[0].metadata.name"/>
          </div>
          <div slot="settings">
            <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/>
          </div>
        </settings-bar>
        <epi-graph :graph="getModelsList[0].graph.detailed" :subgraph="getModelsList[0].subgraph" @node-click="onNodeClick"/>
      </div>
      <div slot="content-right" class="content local">
        <settings-bar>
          <div slot="counters">
            <counters :model-name="getModelsList[1].metadata.name"/>
          </div>
          <div slot="settings">
            <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/>
          </div>
        </settings-bar>
        <epi-graph :graph="getModelsList[1].graph.detailed" :subgraph="getModelsList[1].subgraph"/>
      </div>
    </resizable-divider>
    <!-- <drilldown-panel @close-pane="onCloseDrilldownPanel" :is-open="isOpenDrilldown" :pane-title="drilldownPaneTitle" :pane-subtitle="drilldownPaneSubtitle" >
      <div slot="content">
        <drilldown-metadata-pane :metadata="drilldownMetadata"/>
      </div>
    </drilldown-panel> -->
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
  import ResizableDivider from '@/components/ResizableDivider.vue';
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

  const MODELS_TO_COMPARE = [{ id: 1 }, { id: 2 }]; // SIR and CHIME

  const components = {
    SearchBar,
    SettingsBar,
    Counters,
    Settings,
    LeftSidePanel,
    MetadataPane,
    FacetsPane,
    EpiGraph,
    ResizableDivider,
    DrilldownPanel,
    DrilldownMetadataPane,
  };

  @Component({ components })
  export default class EpiView extends Vue {
    tabs: TabInterface[] = TABS;
    activeTabId: string = 'metadata';
    views: ViewInterface[] = VIEWS;
    selectedViewId = 'functional';
    isOpenDrilldown = false;
    isSplitView = true;
    drilldownPaneTitle = '';
    drilldownPaneSubtitle = '';
    drilldownMetadata: ModelComponentMetadataInterface = null;

    @Getter getSelectedModelId;
    @Getter getModelsList;

  // get selectedModels(): ModelInterface[] {
  //   const modelsList = this.getModelsList;
  //   console.log(modelsList.filter(model => MODELS_TO_COMPARE.includes(model.id)));
  //   return modelsList.filter(model => MODELS_TO_COMPARE.includes(model.id) );
  // }

  // get selectedModel (): ModelInterface {
  //   const modelsList = this.getModelsList;
  //   return modelsList.find(model => model.id === this.getSelectedModelId);
  // }

  // get selectedGraph (): GraphInterface {
  //   return this.selectedViewId === 'causal' ? this.selectedModel.graph.abstract : this.selectedModel.graph.detailed;
  // }

  // get nodeCount (): number {
  //   return this.selectedGraph && this.selectedGraph.nodes.length;
  // }

  // get edgeCount (): number {
  //   return this.selectedGraph && this.selectedGraph.edges.length;
  // }

  // onSplitView (): void {
  //   this.isSplitView = !this.isSplitView;
  // }

  // onTabClick (tabId: string): void {
  //   this.activeTabId = tabId;
  // }

  // onCloseDrilldownPanel ():void {
  //   this.isOpenDrilldown = false;
  //   this.drilldownPaneTitle = '';
  //   this.drilldownMetadata = null;
  // }

  onSetView (viewId: string): void {
    this.selectedViewId = viewId;
  }

  onNodeClick (node: GraphNodeInterface): void {
    console.log(node);
    // this.isOpenDrilldown = true;
    // this.drilldownPaneTitle = node.metadata.units ? node.label + ' (' + node.metadata.units + ')' : node.label;
    // this.drilldownPaneSubtitle = node.type;
    // this.drilldownMetadata = node.metadata;
  }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

  .search-row {
    display: flex;
    border-bottom: 1px solid $border;
    background-color: $secondary-bar-bg;
  }
</style>
