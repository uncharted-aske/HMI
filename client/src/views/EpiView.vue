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
      <counters :node-count="nodeCount" :edge-count="edgeCount"/>
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

  import { ActionColumnInterface, ModelInterface, ModelComponentMetadataInterface, GraphInterface } from '../types/types';

  import ActionColumn from '@/components/ActionColumn.vue';
  import ActionColumnNavBar from '@/components/ActionColumnNavBar.vue';
  import SearchBar from '@/components/SearchBar.vue';
  import Counters from '@/components/Counters.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPane from '@/components/MetadataPane.vue';
  import FacetsPane from '@/components/FacetsPane.vue';
  import EpiGraph from '@/components/EpiGraph.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import DrilldownMetadataPane from '@/components/DrilldownMetadataPane.vue';
  import HierarchySlider from '@/components/HierarchySlider.vue';

  const ACTIONS = [
    { name: 'Facets', icon: 'filter', paneId: 'facets' },
    { name: 'Metadata', icon: 'info', paneId: 'metadata' },
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
    actions: ActionColumnInterface[] = ACTIONS;
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
      return this.activePane && this.actions.find(a => a.paneId === this.activePane).name;
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
        activePane = this.actions.find(a => a.name === actionName).paneId;
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

    onHierarchyChange (level): void {
      this.hierarchyLevel = level;
    }

    onNodeClick (node): void {
      this.isOpenDrilldown = true;
      const units = node.data.metadata.units ? node.data.metadata.units : 'unknown'; 
      this.drilldownPaneTitle = node.label + ' (' + units + ')';
      this.drilldownPaneSubtitle = node.data.type;
      this.drilldownMetadata = node.data.metadata;
    }
  }
</script>

<style lang="scss" scoped>

</style>
