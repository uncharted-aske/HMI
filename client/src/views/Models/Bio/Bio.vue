<template>
  <div class="view-container">
    <left-side-panel :tabs="tabs" :activeTabId="activeTabId" @tab-click="onTabClick">
          <div slot="content">
            <metadata-panel v-if="activeTabId ===  'metadata'" :metadata="selectedModel && selectedModel.metadata"/>
            <!-- <facets-pane v-if="activeTabId === 'facets'" /> -->
          </div>
    </left-side-panel>
    <div class="search-row">
      <search-bar :placeholder="`Search for model components...`" />
      <button class="btn btn-primary m-1" @click="onSplitView" :disabled="!canOpenLocalView">
        <font-awesome-icon :icon="['fas', getIcon ]" />
        <span>{{ getMessage }}</span>
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
        <grafer class="grafer" model="covid-19" layer="boutique" :back-edges="false"></grafer>
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
        <loader :loading="subgraphLoading" />
        <local-graph :data="subgraph"  @node-click="onNodeClick" @edge-click="onEdgeClick" @loaded="subgraphLoading = false"/>
      </div>
    </resizable-grid>
    <drilldown-panel @close-pane="onCloseDrilldownPanel" :is-open="isOpenDrilldown" :pane-title="drilldownPaneTitle" :pane-subtitle="drilldownPaneSubtitle">
      <node-pane v-if="drilldownActivePaneId === 'node'" slot="content" :data="drilldownMetadata"/>
      <edge-pane v-if="drilldownActivePaneId === 'edge'" slot="content" :data="drilldownMetadata"/>
    </drilldown-panel>
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Getter } from 'vuex-class';
  import { Watch } from 'vue-property-decorator';

  import { bgraph } from '@uncharted.software/bgraph';

  import { TabInterface, ModelInterface } from '@/types/types';
  import { GraphInterface, GraphNodeInterface, GraphEdgeInterface } from '@/types/typesGraphs';

  import { emmaaEvidence } from '@/services/EmmaaFetchService';
  import { loadBGraphData, filterToBgraph, formatBGraphOutputToLocalGraph } from '@/utils/BGraphUtil';
  import { isEmpty } from '@/utils/FiltersUtil';

  import Loader from '@/components/widgets/Loader.vue';
  import SearchBar from './components/SearchBar.vue';
  import SettingsBar from '@/components/SettingsBar.vue';
  import Counters from '@/components/Counters.vue';
  import Settings from '@/views/Models/components/Settings.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPanel from '@/views/Models/components/MetadataPanel.vue';
  import FacetsPane from './components/FacetsPane.vue';
  import LocalGraph from './components/Graphs/LocalGraph.vue';
  import ResizableGrid from '@/components/ResizableGrid/ResizableGrid.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import EdgePane from './components/DrilldownPanel/EdgePane.vue';
  import NodePane from './components/DrilldownPanel/NodePane.vue';

  import Grafer from './components/Graphs/Grafer.vue';

  const TABS: TabInterface[] = [
    { name: 'Facets', icon: 'filter', id: 'facets' },
    { name: 'Metadata', icon: 'info', id: 'metadata' },
  ];

  const components = {
    SearchBar,
    SettingsBar,
    Counters,
    Settings,
    LeftSidePanel,
    MetadataPanel,
    FacetsPane,
    LocalGraph,
    ResizableGrid,
    DrilldownPanel,
    NodePane,
    EdgePane,
    Grafer,
    Loader,
  };

  @Component({ components })
  export default class Bio extends Vue {
    // Initialize as undefined to prevent vue from tracking changes to the bgraph instance
    bgraphInstance: any = undefined;

    tabs: TabInterface[] = TABS;
    activeTabId: string = 'metadata';

    isOpenDrilldown: boolean = false;
    drilldownActivePaneId: string = '';
    drilldownPaneTitle = '';
    drilldownPaneSubtitle = '';
    drilldownMetadata: any = null;

    isSplitView = false;
    subgraph: GraphInterface = null;
    subgraphLoading: boolean = false;

    @Getter getSelectedModelIds;
    @Getter getModelsList;
    @Getter getFilters;

    @Watch('getFilters') onGetFiltersChanged (): void {
      if (this.bgraphInstance) {
        const subgraph = filterToBgraph(this.bgraphInstance, this.getFilters);
        if (_.isEmpty(subgraph)) {
          this.isSplitView = false;
          this.subgraph = null;
        } else {
          this.subgraph = formatBGraphOutputToLocalGraph(subgraph);
          this.subgraphLoading = true;
        }
      }
    }

    get getIcon (): string {
      return this.isSplitView ? 'window-maximize' : 'columns';
    }

    get getMessage (): string {
      return this.isSplitView ? 'Close Local View' : 'Open Local View';
    }

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

    get canOpenLocalView (): boolean {
      return !isEmpty(this.getFilters);
    }

    async mounted (): Promise<void> {
      const [bgNodes, bgEdges] = await loadBGraphData();
      this.bgraphInstance = bgraph.graph(bgNodes, bgEdges);
    }

    onSplitView (): void {
      this.isSplitView = !this.isSplitView;

      if (this.isSplitView) {
        if (this.bgraphInstance) {
          const subgraph = filterToBgraph(this.bgraphInstance, this.getFilters);
          this.subgraph = formatBGraphOutputToLocalGraph(subgraph);
          this.subgraphLoading = true;
        }
      } else {
        this.subgraph = null;
      }
    }

    onTabClick (tabId: string): void {
      this.activeTabId = tabId;
    }

    onCloseDrilldownPanel ():void {
      this.isOpenDrilldown = false;
      this.drilldownPaneTitle = '';
      this.drilldownMetadata = null;
    }

    onNodeClick (node: GraphNodeInterface): void {
      this.isOpenDrilldown = true;
      this.drilldownActivePaneId = 'node';

      this.drilldownPaneTitle = node.label;
      this.drilldownPaneSubtitle = 'Type: Node';
      this.drilldownMetadata = node.data;
    }

    async onEdgeClick (edge: GraphEdgeInterface): Promise<void> {
      this.isOpenDrilldown = true;
      this.drilldownActivePaneId = 'edge';

      this.drilldownPaneTitle = `${edge.metadata.sourceLabel} → ${edge.metadata.targetLabel}`;
      this.drilldownPaneSubtitle = `Type: ${edge.metadata.type}`;
      this.drilldownMetadata = await emmaaEvidence({
        stmt_hash: edge.metadata.statement_id,
        source: 'model_statement',
        model: this.selectedModel.metadata.id,
        format: 'json',
      });
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
