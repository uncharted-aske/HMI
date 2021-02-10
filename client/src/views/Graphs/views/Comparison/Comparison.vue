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
      <div slot="2" class="h-100 w-100 d-flex flex-column">
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
      { id: '1', label: 's, s_c', nodeType: 'overlapping' },
      { id: '2', label: 'gamma', nodeType: 'overlapping' },
      { id: '3', label: 'beta', nodeType: 'overlapping' },
      { id: '4', label: 'i, i_c', nodeType: 'overlapping' },
      { id: '5', label: 'r, r_c', nodeType: 'overlapping' },
      { id: '6', label: 's, s_c', nodeType: 'overlapping' },
      { id: '7', label: 'i, i_c', nodeType: 'overlapping' },
      { id: '8', label: 'r, r_c', nodeType: 'overlapping' },
      { id: '9', label: 'OAP-1', nodeType: 'AP', ids: [] },
      { id: '10', label: 'NOAP(SIR)-1', nodeType: 'NOAP', ids: [] },
      { id: '11', label: 'NOAP(CHIME)-2', nodeType: 'NOAP', ids: [] },
      { id: '12', label: 'NOAP(CHIME)-1', nodeType: 'NOAP', ids: [] },
    ],
    edges: [
      { source: '1', target: '9', edgeType: 'overlapping' },
      { source: '2', target: '9', edgeType: 'overlapping' },
      { source: '4', target: '9', edgeType: 'overlapping' },
      { source: '5', target: '9', edgeType: 'overlapping' },
      { source: '3', target: '9', edgeType: 'overlapping' },
      { source: '9', target: '6', edgeType: 'overlapping' },
      { source: '9', target: '7', edgeType: 'overlapping' },
      { source: '9', target: '8', edgeType: 'overlapping' },
      { source: '10', target: '9', edgeType: 'NOAP' },
      { source: '11', target: '9', edgeType: 'NOAP' },
      { source: '1', target: '12', edgeType: 'NOAP' },
      { source: '2', target: '12', edgeType: 'NOAP' },
      { source: '12', target: '3', edgeType: 'NOAP' },
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
      return [['1', '3', '2']];
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
</style>
