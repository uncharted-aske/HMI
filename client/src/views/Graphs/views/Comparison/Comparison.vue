<template>
  <div class="view-container">
    <div class="search-row">
      <search-bar />
    </div>
    <resizable-grid :map="gridMap" :dimensions="{'3': { width: '10px', widthFixed: true }}">
      <div slot="1" class="h-100 w-100 d-flex flex-column">
        <div class="h-50 w-100" v-for="(model) in selectedModels" :key="model.id">
          <settings-bar>
          <div slot="left">
           <counters
              :title="model.metadata.name"
              :data="[`${model.graph.detailed.nodes.length} Nodes`, `${model.graph.detailed.edges.length} Edges`]"
            />
          </div>
          <div slot="right">
            <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/>
          </div>
        </settings-bar>
        <epi-graph class="h-100" :graph="model.graph.detailed" :subgraph="model.subgraph" :reference="reference" @node-click="onNodeClick" @node-hover="onNodeHover"/>
        </div>
      </div>
      <div slot="2" class="h-100 w-100 d-flex flex-column border-intersection-graph">
        <settings-bar>
          <div slot="left">
            <counters
              :title="`Intersection Graph`"
              :data="[`${nodeCountIntersectionGraph} Nodes`, `${edgeCountIntersectionGraph} Edges`]"
            />          </div>
          <div slot="right">
            <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/>
          </div>
        </settings-bar>
        <local-epi-graph class="h-100" v-if="isSplitView" :graph="intersectionGraph" @node-click="onNodeClick"/>
      </div>
    </resizable-grid>
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

  import { TabInterface, ViewInterface, ModelComponentMetadataInterface } from '@/types/types';
  import { GraphNodeInterface } from '@/views/Graphs/types/types';

  import SearchBar from './components/SearchBar/SearchBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Counters from '@/views/Graphs/components/Counters/Counters.vue';
  import Settings from '@/views/Graphs/components/Settings/Settings.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPane from '@/views/Graphs/components/MetadataPane/MetadataPane.vue';
  import EpiGraph from './components/EpiGraphs/EpiGraph.vue';
  import LocalEpiGraph from './components/EpiGraphs/LocalEpiGraph.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  // import DrilldownPanel from '@/components/DrilldownPanel.vue';
  // import DrilldownMetadataPane from '@/views/Graphs/components/DrilldownMetadataPanel/DrilldownMetadataPane.vue';

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
    LocalEpiGraph,
    ResizableGrid,
    // DrilldownPanel,
    // DrilldownMetadataPane,
  };

  const intersectionGraph = {
    nodes: [
      { id: '1', label: 's, sc' },
      { id: '2', label: 'beta' },
      { id: '3', label: 'r, rc' },
      { id: '4', label: 'gamma' },
      { id: '5', label: 'R, RC' },
      { id: '5', label: 's, sc' },
      { id: '6', label: 'r, rc' },
      { id: '7', label: 'R, RC' },
      { id: '8', label: 'NOAP 1', nodeType: 'NOAP' },
      { id: '9', label: 'NOAP 2', nodeType: 'NOAP' },
      { id: '10', label: 'AP 1', nodeType: 'AP' },
      { id: '11', label: 'AP 2', nodeType: 'AP' },
    ],
    edges: [
      { source: '1', target: '10' },
      { source: '2', target: '10' },
      { source: '3', target: '10' },
      { source: '3', target: '11' },
      { source: '4', target: '11' },
      { source: '5', target: '11' },
      { source: '10', target: '5' },
      { source: '10', target: '6' },
      { source: '11', target: '7' },
      { source: '8', target: '2' },
      { source: '9', target: '2' },
    ],
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
    intersectionGraph: any = intersectionGraph;

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

  get nodeCountIntersectionGraph (): number {
      return this.intersectionGraph.nodes.length;
  }

  get edgeCountIntersectionGraph (): number {
      return this.intersectionGraph.edges.length;
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
@import '@/styles/variables';
.border-intersection-graph {
  border-left: 10px solid $bg-body;
}
</style>
