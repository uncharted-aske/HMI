<template>
  <div class="view-container">
    <left-side-panel :tabs="tabs" :activeTabId="activeTabId" @tab-click="onTabClick">
          <div slot="content">
            <metadata-panel v-if="activeTabId ===  'metadata'" :metadata="selectedModel && selectedModel.metadata"/>
            <!-- <facets-pane v-if="activeTabId === 'facets'" /> -->
          </div>
    </left-side-panel>
    <div class="search-row">
      <search-bar :placeholder="`Search for model components...`"/>
      <button class="btn btn-primary m-1" @click="onSplitView">
        Add Subgraph
      </button>
    </div>
    <resizable-grid :map="gridMap" :dimensions="{'3': { width: '10px', widthFixed: true }}">
      <div slot="1" class="h-100 w-100 d-flex flex-column">
        <settings-bar>
          <div slot="left">
            <counters
              :title="selectedModel && selectedModel.metadata.name"
              :data="[`448723 Nodes`, `44104 Edges`]"
            />
          </div>
          <div slot="settings">
            <!-- <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/> -->
          </div>
        </settings-bar>
        <!-- <grafer class="grafer" model="covid-19" layer="boutique" :back-edges="true"></grafer> -->
      </div>
      <div slot="2" class="h-100 w-100 d-flex flex-column">
        <settings-bar>
          <div slot="right">
            <counters
              :title="`Subgraph`"
              :data="[`${subgraphNodeCount} Nodes`, `${subgraphEdgeCount} Edges`]"
            />
          </div>
          <div slot="right">
            <!-- <settings @view-change="onSetView" :views="views" :selected-view-id="selectedViewId"/> -->
          </div>
        </settings-bar>
        <local-bio-graph v-if="isSplitView" :graph="subgraph"  @node-click="onNodeClick" @edge-click="onEdgeClick"/>
      </div>
    </resizable-grid>
    <drilldown-panel @close-pane="onCloseDrilldownPanel" :is-open="isOpenDrilldown" :tabs="tabsDrilldown" :pane-title="drilldownPaneTitle" :pane-subtitle="drilldownPaneSubtitle">
      <drilldown-metadata-node v-if="isOpenDrilldown === 'node'" slot="metadata" :data="drilldownMetadata" @add-edge="onAddEdge"/>
      <drilldown-metadata-edge v-if="isOpenDrilldown === 'edge'" slot="metadata" :data="drilldownMetadata"/>
      <!-- <drilldown-parameters-pane v-if="activeTabIdDrilldown ===  'parameters'"/> -->
    </drilldown-panel>
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter } from 'vuex-class';

  import { TabInterface, ModelInterface } from '@/types/types';
  import { GraphInterface, GraphNodeInterface, GraphEdgeInterface, SubgraphEdgeInterface } from '@/types/typesGraphs';

  import { emmaaEvidence } from '@/services/EmmaaFetchService';

  import SearchBar from './components/SearchBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Counters from '@/components/Counters.vue';
  import Settings from '@/views/Models/components/Settings.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPanel from '@/views/Models/components/MetadataPanel.vue';
  import FacetsPane from './components/FacetsPane.vue';
  import LocalBioGraph from './components/BioGraphs/LocalBioGraph.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import DrilldownMetadataNode from './components/DrilldownMetadataPanel/DrilldownMetadataNode.vue';
  import DrilldownMetadataEdge from './components/DrilldownMetadataPanel/DrilldownMetadataEdge.vue';
  import Grafer from './components/BioGraphs/Grafer.vue';

  const TABS: TabInterface[] = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
    { name: 'Metadata', icon: 'info', id: 'metadata' },
  ];

  const TABS_DRILLDOWN: TabInterface[] = [
    { name: 'Metadata', icon: 'filter', id: 'metadata' },
  ];

  const components = {
    SearchBar,
    SettingsBar,
    Counters,
    Settings,
    LeftSidePanel,
    MetadataPanel,
    FacetsPane,
    LocalBioGraph,
    ResizableGrid,
    DrilldownPanel,
    DrilldownMetadataNode,
    DrilldownMetadataEdge,
    Grafer,
  };

  @Component({ components })
  export default class BioView extends Vue {
    tabs: TabInterface[] = TABS;
    tabsDrilldown: TabInterface[] = TABS_DRILLDOWN;
    activeTabId: string = 'metadata';
    isOpenDrilldown: string = '';
    isSplitView = false;
    drilldownPaneTitle = '';
    drilldownPaneSubtitle = '';
    drilldownMetadata: any = null;
    subgraph: GraphInterface = null;

    @Getter getSelectedModelIds;
    @Getter getModelsList;

    get selectedModel (): ModelInterface {
      const modelsList = this.getModelsList;
      return modelsList.find(model => model.metadata.id === 'covid19'); // Only COVID-19 model for now
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
      // Get the COVID-19 model subgraph
      const modelsList = this.getModelsList;
      const selectedModel = modelsList.find(model => model.id === 4); // Get COVID-19 model
      this.subgraph = selectedModel.subgraph;
    }

    onTabClick (tabId: string): void {
      this.activeTabId = tabId;
    }

    onCloseDrilldownPanel ():void {
      this.isOpenDrilldown = '';
      this.drilldownPaneTitle = '';
      this.drilldownMetadata = null;
    }

  // onSetView (viewId: string): void {
  //   this.selectedViewId = viewId;
  // }

    onNodeClick (node: GraphNodeInterface): void {
      this.isOpenDrilldown = 'node';
      this.drilldownPaneTitle = node.label;
      this.drilldownPaneSubtitle = 'Node';
      this.drilldownMetadata = node.metadata;
    }

    async onEdgeClick (edge: GraphEdgeInterface): Promise<void> {
      this.isOpenDrilldown = 'edge';
      this.drilldownPaneTitle = `${edge.metadata.sourceLabel} → ${edge.metadata.targetLabel}`;
      this.drilldownPaneSubtitle = `Type: ${edge.metadata.type}`;
      this.drilldownMetadata = await emmaaEvidence({
        stmt_hash: edge.metadata.statement_id,
        source: 'model_statement',
        model: this.selectedModel.metadata.id,
        format: 'json',
      });
    }

    onAddEdge (edge: SubgraphEdgeInterface): void {
      const subgraph = _.cloneDeep(this.subgraph);
      const sourceNode = { id: edge.source, label: edge.source_label, nodeType: 'ontological grounding' };
      const targetNode = { id: edge.target, label: edge.target_label, nodeType: 'ontological grounding' };

      // Check if nodes already exists in subgraph
      const sourceFound = subgraph.nodes.find(node => node.id === sourceNode.id);
      const targetFound = subgraph.nodes.find(node => node.id === targetNode.id);
      if (!sourceFound) {
        subgraph.nodes.push(sourceNode);
      }
      if (!targetFound) {
        subgraph.nodes.push(targetNode);
      }

      // Check if edges already exist in the subgraph
      const edgeFound = subgraph.edges.find(e => e.id === edge.id);
      if (!edgeFound) {
        subgraph.edges.push(edge);
      }

      this.subgraph = subgraph;
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/styles/variables";

  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .grafer {
    flex-grow: 1;
  }
</style>
