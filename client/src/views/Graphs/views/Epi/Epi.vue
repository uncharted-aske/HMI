<template>
  <div class="view-container">
    <left-side-panel :tabs="tabs" :activeTabId="activeTabId" @tab-click="onTabClick">
          <div slot="content">
            <metadata-pane v-if="activeTabId ===  'metadata'" :metadata="selectedModel.metadata"/>
            <facets-pane v-if="activeTabId === 'facets'" />
          </div>
    </left-side-panel>
    <div class="search-row">
      <search-bar :placeholder="`Search for model components...`" @run-query="onRunQuery"/>
      <button class="btn btn-primary m-1" @click="onSplitView">
        Add Subgraph
      </button>
    </div>
    <resizable-grid :map="gridMap" :dimensions="{'3': { width: '10px', widthFixed: true }}">
      <div slot="1" class="h-100 w-100 d-flex flex-column">
        <settings-bar>
          <div slot="left">
            <counters
              :title="selectedModel.metadata.name"
              :data="[`${nodeCount} Nodes`, `${edgeCount} Edges`]"
            />
          </div>
          <div slot="right">
            <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/>
          </div>
        </settings-bar>
        <global-epi-graph v-if="selectedModel" :graph="selectedGraph" :highlights="highlights" @node-click="onNodeClick"/>
      </div>
      <div slot="2" class="h-100 w-100 d-flex flex-column">
        <settings-bar>
          <div slot="left">
            <counters
              :title="`Subgraph`"
              :data="[`${subgraphNodeCount} Nodes`, `${subgraphEdgeCount} Edges`]"
            />          </div>
          <div slot="right">
            <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/>
          </div>
        </settings-bar>
        <local-epi-graph v-if="isSplitView" :graph="subgraph" @node-click="onNodeClick"/>
      </div>
    </resizable-grid>
    <drilldown-panel @close-pane="onCloseDrilldownPanel" :is-open="isOpenDrilldown" :tabs="tabsDrilldown" :activeTabId="activeTabIdDrilldown" :pane-title="drilldownPaneTitle" :pane-subtitle="drilldownPaneSubtitle" @tab-click="onTabClickDrilldown">
      <div slot="content">
        <drilldown-metadata-pane v-if="activeTabIdDrilldown ===  'metadata'" :metadata="drilldownMetadata"/>
        <drilldown-parameters-pane v-if="activeTabIdDrilldown ===  'parameters'"/>
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
  import DrilldownMetadataPane from './components/DrilldownMetadataPanel/DrilldownMetadataPane.vue';
  import DrilldownParametersPane from './components/DrilldownMetadataPanel/DrilldownParametersPane.vue';
  import { SubgraphInterface } from '@/graphs/svg/types/types';

  const TABS: TabInterface[] = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
    { name: 'Metadata', icon: 'info', id: 'metadata' },
  ];

  const TABS_DRILLDOWN: TabInterface[] = [
    { name: 'Metadata', icon: 'filter', id: 'metadata' },
    { name: 'Parameters', icon: 'info', id: 'parameters' },
  ];

  const VIEWS: ViewInterface[] = [
    { name: 'Causal', id: 'causal' },
    { name: 'Functional', id: 'functional' },
  ];

  const pathSubgraph: SubgraphInterface = { nodes: [{ id: '4f8f229a-aab4-4db4-844b-64f68920dfad' }, { id: '4a8eb129-c503-4592-8cc2-e45b93bd8c26' }, { id: '024f553a-5070-482f-a94f-82b97dbdd88d' }, { id: 'f0ca40d1-b8f2-4d10-81c3-08cf796d9acd' }, { id: '725dd80c-e5c8-46ab-8df1-8f8fa9f3515a' }, { id: '7ce1948c-b271-42d8-9b4b-29df3da5fdde' }, { id: '0e1f1d8c-2f80-4aa1-853c-8d9b8a03c2aa' }, { id: 'e1d3a02d-12f9-4b77-b35c-80695a219a5e' }, { id: 'b2a9f511-b7ec-48c5-9b6e-183821bf39c3' }, { id: '620874cf-3a25-43e1-9848-dde986bcad1f' }, { id: 'aa94c3cc-5193-4122-b0ed-e83faefc214d' }, { id: 'ef3ed63b-1bbc-4de7-a9d7-457b91e1a30d' }, { id: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1' }, { id: '4e9f2344-29a6-4457-93cf-da8589382e3d' }, { id: '9d2259db-62cc-444f-a4d4-03f5769ba39b' }], edges: [{ source: '4f8f229a-aab4-4db4-844b-64f68920dfad', target: '4a8eb129-c503-4592-8cc2-e45b93bd8c26' }, { source: '4a8eb129-c503-4592-8cc2-e45b93bd8c26', target: '024f553a-5070-482f-a94f-82b97dbdd88d' }, { source: '024f553a-5070-482f-a94f-82b97dbdd88d', target: 'f0ca40d1-b8f2-4d10-81c3-08cf796d9acd' }, { source: 'f0ca40d1-b8f2-4d10-81c3-08cf796d9acd', target: '725dd80c-e5c8-46ab-8df1-8f8fa9f3515a' }, { source: '725dd80c-e5c8-46ab-8df1-8f8fa9f3515a', target: '7ce1948c-b271-42d8-9b4b-29df3da5fdde' }, { source: '7ce1948c-b271-42d8-9b4b-29df3da5fdde', target: '0e1f1d8c-2f80-4aa1-853c-8d9b8a03c2aa' }, { source: '0e1f1d8c-2f80-4aa1-853c-8d9b8a03c2aa', target: 'e1d3a02d-12f9-4b77-b35c-80695a219a5e' }, { source: 'e1d3a02d-12f9-4b77-b35c-80695a219a5e', target: 'b2a9f511-b7ec-48c5-9b6e-183821bf39c3' }, { source: 'b2a9f511-b7ec-48c5-9b6e-183821bf39c3', target: '620874cf-3a25-43e1-9848-dde986bcad1f' }, { source: '620874cf-3a25-43e1-9848-dde986bcad1f', target: 'aa94c3cc-5193-4122-b0ed-e83faefc214d' }, { source: 'aa94c3cc-5193-4122-b0ed-e83faefc214d', target: 'ef3ed63b-1bbc-4de7-a9d7-457b91e1a30d' }, { source: 'ef3ed63b-1bbc-4de7-a9d7-457b91e1a30d', target: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1' }, { source: 'a414982f-51fb-4d41-abf8-b736e9fc6ac1', target: '4e9f2344-29a6-4457-93cf-da8589382e3d' }, { source: '4e9f2344-29a6-4457-93cf-da8589382e3d', target: '9d2259db-62cc-444f-a4d4-03f5769ba39b' }] };

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
    DrilldownParametersPane,
  };

  @Component({ components })
  export default class EpiView extends Vue {
    tabs: TabInterface[] = TABS;
    tabsDrilldown: TabInterface[] = TABS_DRILLDOWN;
    activeTabId: string = 'metadata';
    activeTabIdDrilldown: string = 'metadata';
    views: ViewInterface[] = VIEWS;
    selectedViewId = 'causal';
    isOpenDrilldown = false;
    isSplitView = false;
    drilldownPaneTitle = '';
    drilldownPaneSubtitle = '';
    drilldownMetadata: any = null;
    subgraph: GraphInterface = null;
    highlights: SubgraphInterface = null;

    @Getter getSelectedModelIds;
    @Getter getModelsList;

    get selectedModel (): ModelInterface {
      const modelsList = this.getModelsList;
      return modelsList.find(model => model.id === (this.getSelectedModelIds && this.getSelectedModelIds[0]));
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

    get subgraphNodeCount (): number {
      return this.subgraph && this.subgraph.nodes.length;
    }

    get subgraphEdgeCount (): number {
      return this.subgraph && this.subgraph.edges.length;
    }

    get gridMap (): string[][] {
      return this.isSplitView ? [['1', '3', '2']] : [['1']];
    }

    onSplitView (): void {
      this.isSplitView = !this.isSplitView;
      if (!this.highlights) return;

      // Get path from highlights
      const path = this.highlights;
      const edges = path.edges;
      const nodes = path.nodes.map(node => this.selectedGraph.nodes.find(n => n.id === node.id));

      // // Get the CHIME GrFN subgraph
      // const modelsList = this.getModelsList;
      // const selectedModel = modelsList.find(model => model.id === 2); // Get CHIME model
      // const GrFN = selectedModel.graph.detailed;
      // // Get nodes only corresponding to the SIR plate
      // const nodes = GrFN.nodes.filter(n => n.parent === 'bac81b1a-3a6d-45ad-9725-947e507f6930'); // sir plate has id: 2bfc84bb-f036-4420-a68c-4ef6d72928e9
      // const nodesMap = new Map();
      // // Creates a map of nodes and its corresponding parents
      // nodes.forEach(n => {
      //   nodesMap[n.id] = n.parent;
      // });
      // const edges = GrFN.edges.filter(e => {
      //   const sourceParent = nodesMap[e.source];
      //   const targetParent = nodesMap[e.target];
      //   return ((sourceParent === 'bac81b1a-3a6d-45ad-9725-947e507f6930') && (targetParent === 'bac81b1a-3a6d-45ad-9725-947e507f6930'));
      // });

      this.subgraph = { nodes, edges };
    }

    onTabClick (tabId: string): void {
      this.activeTabId = tabId;
    }

    onTabClickDrilldown (tabId: string): void {
      this.activeTabIdDrilldown = tabId;
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

    onRunQuery (): void {
      this.highlights = pathSubgraph;
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

</style>
