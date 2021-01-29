<template>
  <div class="view-container">
    <div class="search-row">
      <search-bar />
    </div>
    <resizable-grid :map="gridMap">
      <div :slot="model.id" class="h-100 w-100 d-flex flex-column" v-for="(model) in selectedModels" :key="model.id">
        <settings-bar>
          <div slot="left">
            <counters :labels="[model.metadata.name]"/>
          </div>
          <div slot="right">
            <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/>
          </div>
        </settings-bar>
        <epi-graph :graph="model.graph.detailed" :subgraph="model.subgraph" :reference="reference" @node-click="onNodeClick" @node-hover="onNodeHover"/>
      </div>
    </resizable-grid>
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

  import { TabInterface, ViewInterface, ModelComponentMetadataInterface } from '@/types/types';
  import { GraphNodeInterface } from '@/views/Graphs/types/types';

  import SearchBar from './components/SearchBar/SearchBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Counters from '@/views/Graphs/components/Counters/Counters.vue';
  import Settings from '@/views/Graphs/components/Settings/Settings.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPane from '@/views/Graphs/components/MetadataPane/MetadataPane.vue';
  import EpiGraph from './components/EpiGraph/EpiGraph.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
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
    EpiGraph,
    ResizableGrid,
    DrilldownPanel,
    DrilldownMetadataPane,
  };

  @Component({ components })
  export default class EpiView extends Vue {
    tabs: TabInterface[] = TABS;
    activeTabId: string = 'metadata';
    views: ViewInterface[] = VIEWS;
    selectedViewId: string = 'functional';
    isOpenDrilldown: boolean = false;
    isSplitView: boolean = true;
    drilldownPaneTitle: string = '';
    drilldownPaneSubtitle: string = '';
    drilldownMetadata: ModelComponentMetadataInterface = null;
    reference: string = ''

    @Getter getSelectedModelIds;
    @Getter getModelsList;

    get gridMap (): string[][] {
      return [this.selectedModels.map(model => model.id)];
    }

  get selectedModels (): any[] {
    const modelsList = this.getModelsList;
    const selectedIds = new Set(this.getSelectedModelIds);
    return modelsList.filter(model => selectedIds.has(model.id));
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
    this.drilldownPaneTitle = node.label;
    this.drilldownPaneSubtitle = node.nodeType;
    this.drilldownMetadata = node.metadata;
  }

  onNodeHover (node: GraphNodeInterface):void {
    this.reference = node['linked-to'][0]['node-id'];
  }
  }
</script>

<style lang="scss" scoped>
</style>
