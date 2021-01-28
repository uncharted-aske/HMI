<template>
  <div class="view-container">
    <left-side-panel :tabs="tabs" :activeTabId="activeTabId" @tab-click="onTabClick">
          <div slot="content">
            <metadata-pane v-if="activeTabId ===  'metadata'" :metadata="selectedModel.metadata"/>
            <facets-pane v-if="activeTabId === 'facets'" />
          </div>
    </left-side-panel>
    <div class="search-row">
      <search-bar />
      <button class="btn btn-primary m-1" @click="onSplitView">
        Add Subgraph
      </button>
    </div>
    <resizable-grid :map="gridMap" :dimensions="{'3': { width: '100px', widthFixed: true }}">
      <div slot="1" class="h-100 w-100 d-flex flex-column">
        <settings-bar>
          <div slot="counters">
            <counters
              :title="selectedModel.metadata.name"
              :data="[`${nodeCount} Nodes`, `${edgeCount} Edges`]"
            />
          </div>
          <div slot="settings">
            <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/>
          </div>
        </settings-bar>
        <global-epi-graph v-if="selectedModel" :graph="selectedGraph" @node-click="onNodeClick"/>
      </div>
      <div slot="2" class="h-100 w-100 d-flex flex-column">
        <settings-bar>
          <div slot="counters">
            <counters :model-name="selectedModel.metadata.name" :node-count="nodeCount" :edge-count="edgeCount"/>
          </div>
          <div slot="settings">
            <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/>
          </div>
        </settings-bar>
        <local-epi-graph v-if="isSplitView" :graph="subgraph" @node-click="onNodeClick"/>
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

  import { TabInterface, ViewInterface, ModelInterface } from '@/types/types';
  import { GraphInterface, GraphNodeInterface } from '@/views/Graphs/types/types';
  import { NodeTypes } from '@/graphs/svg/encodings';

  import SearchBar from './components/SearchBar/SearchBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Counters from '@/views/Graphs/components/Counters/Counters.vue';
  import Settings from '@/views/Graphs/components/Settings/Settings.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPane from '@/views/Graphs/components/MetadataPane/MetadataPane.vue';
  import FacetsPane from './components/FacetsPane/FacetsPane.vue';
  import GlobalEpiGraph from './components/EpiGraphs/GlobalEpiGraph.vue';
  import LocalEpiGraph from './components/EpiGraphs/LocalEpiGraph.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import DrilldownMetadataPane from '@/views/Graphs/components/DrilldownMetadataPanel/DrilldownMetadataPane.vue';

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
    FacetsPane,
    GlobalEpiGraph,
    LocalEpiGraph,
    ResizableGrid,
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
    isSplitView = false;
    drilldownPaneTitle = '';
    drilldownPaneSubtitle = '';
    drilldownMetadata: any = null;
    subgraph: GraphInterface = null;

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
      const leafNodesCount = this.selectedGraph.nodes.filter(n => n.nodeType && n.nodeType !== NodeTypes.NODES.CONTAINER).length;
      return leafNodesCount;
    }

    get edgeCount (): number {
      return this.selectedGraph && this.selectedGraph.edges.length;
    }

    get gridMap (): string[][] {
      return this.isSplitView ? [['1', '3', '2']] : [['1']];
    }

    onSplitView (): void {
      this.isSplitView = !this.isSplitView;

      // Get the CHIME GrFN subgraph
      const modelsList = this.getModelsList;
      const selectedModel = modelsList.find(model => model.id === 2); // Get CHIME model
      const GrFN = selectedModel.graph.detailed;
      // Get nodes only corresponding to the SIR plate
      const nodes = GrFN.nodes.filter(n => n.parent === '2bfc84bb-f036-4420-a68c-4ef6d72928e9'); // sir plate has id: 2bfc84bb-f036-4420-a68c-4ef6d72928e9
      const nodesMap = new Map();
      // Creates a map of nodes and its corresponding parents
      nodes.forEach(n => {
        nodesMap[n.id] = n.parent;
      });
      const edges = GrFN.edges.filter(e => {
        const sourceParent = nodesMap[e.source];
        const targetParent = nodesMap[e.target];
        return ((sourceParent === '2bfc84bb-f036-4420-a68c-4ef6d72928e9') && (targetParent === '2bfc84bb-f036-4420-a68c-4ef6d72928e9'));
      });

      this.subgraph = { nodes, edges };
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
      this.drilldownPaneTitle = node.label;
      this.drilldownPaneSubtitle = node.nodeType;
      this.drilldownMetadata = node.metadata;
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

</style>
