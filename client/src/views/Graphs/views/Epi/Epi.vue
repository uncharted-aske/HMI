<template>
  <div class="view-container">
    <action-column>
      <div slot="actions">
        <action-column-nav-bar :actions="actions" :currentAction="currentAction" @set-active-pane="onSetActive" />
      </div>
    </action-column>
    <left-side-panel @close-pane="onCloseLeftSidePanel"  v-if="activePane">
          <div slot="content">
            <facets-pane v-if="activePane === actions[0].paneId" />
            <metadata-pane v-if="activePane ===  actions[1].paneId && selectedModel" :metadata="selectedModel.metadata"/>
          </div>
    </left-side-panel>
    <div class="content">
      <search-bar />
      <counters :model-name="selectedModel.metadata.name" :node-count="nodeCount" :edge-count="edgeCount"/>
      <hierarchy-slider @hierarchy-change="onHierarchyChange" :hierarchy-level="hierarchyLevel"/>
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

  import { TabInterface, ModelInterface, ModelComponentMetadataInterface } from '@/types/types';
  import { GraphInterface, GraphNodeInterface } from '@/views/Graphs/types/types';

  import ActionColumn from '@/components/ActionColumn.vue';
  import ActionColumnNavBar from '@/components/ActionColumnNavBar.vue';
  import SearchBar from './components/SearchBar/SearchBar.vue';
  import Counters from '@/views/Graphs/components/Counters/Counters.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPane from '@/views/Graphs/components/MetadataPane/MetadataPane.vue';
  import FacetsPane from './components/FacetsPane/FacetsPane.vue';
  import EpiGraph from './components/EpiGraph/EpiGraph.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import DrilldownMetadataPane from '@/views/Graphs/components/DrilldownMetadataPanel/DrilldownMetadataPane.vue';
  import HierarchySlider from './components/HierarchySlider/HierarchySlider.vue';

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
    EpiGraph,
    DrilldownPanel,
    DrilldownMetadataPane,
    HierarchySlider,
  };

  @Component({ components })
  export default class EpiView extends Vue {
    isOpenDrilldown = false;
    activePane = '';
    actions: TabInterface[] = ACTIONS;
    drilldownPaneTitle = '';
    drilldownPaneSubtitle = '';
    drilldownMetadata: ModelComponentMetadataInterface = null;
    hierarchyLevel = 1;

    @Getter getSelectedModelId;
    @Getter getModelsList;

    get selectedModel (): ModelInterface {
      const modelsList = this.getModelsList;
      return modelsList.find(model => model.id === this.getSelectedModelId);
    }

    get selectedGraph (): GraphInterface {
      return this.hierarchyLevel === 1 ? this.selectedModel.graph.abstract : this.selectedModel.graph.detailed;
    }

    get currentAction (): string {
      return this.activePane && this.actions.find(a => a.id === this.activePane).name;
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

    onCloseLeftSidePanel ():void {
      this.activePane = '';
    }

    onCloseDrilldownPanel ():void {
      this.isOpenDrilldown = false;
      this.drilldownPaneTitle = '';
      this.drilldownMetadata = null;
    }

    onHierarchyChange (level: number): void {
      this.hierarchyLevel = level;
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
