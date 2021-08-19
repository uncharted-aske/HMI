<template>
  <div class="view-container">
    <main>
      <div class="d-flex flex-column h-100">
        <div class="search-row">
          <search-bar :pills="searchPills" :placeholder="`Search for Documents...`" />
        </div>
        <settings-bar>
          <counters slot="left" :data="[{ name: 'Documents', value: 176000 }]"/>
          <button
            type="button" class="btn btn-secondary mr-1"
            slot="right"
            @click="$router.push({ name: 'docsCards' })"
          >
            Document Artifact-based View
          </button>
        </settings-bar>
        <grafer
          class="grafer"
          layer="epi"
          data="info"
          @grafer_click="onGraferClick"
          @loaded="mainGraphLoading = false"
          @loaded-layers="onLoadedLayers"
        />
      </div>
    </main>
    <drilldown-panel :tabs="drilldownTabs" :is-open="isOpenDrilldown" :active-tab-id="drilldownActiveTabId" @close-pane="onCloseDrilldownPanel" @tab-click="onDrilldownTabClick">
      <knowledge-preview-pane v-if="drilldownActiveTabId === 'preview'" slot="content" :data="drilldownData" @open-modal="showModalDocuments = true"/>
    </drilldown-panel>
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';
  import Component from 'vue-class-component';
  import Vue from 'vue';

  import SearchBar from '@/components/SearchBar.vue';

  import SettingsBar from '@/components/SettingsBar.vue';
  import Settings from '../components/Settings.vue';
  import Counters from '@/components/Counters.vue';

  import Grafer from '../components/Graphs/Grafer.vue';
  import DrilldownPanel from '@/components/DrilldownPanel.vue';
  import KnowledgePreviewPane from '../components/DrilldownPanel/KnowledgePreviewPane.vue';
  import { CardInterface, GraferEventDetail, TabInterface } from '@/types/types';
  import { convertDataToGraferV4, LayoutInfo } from '@/views/Knowledge/components/Graphs/convertDataToGraferV4';

  import { getS3Util } from '@/utils/FetchUtil';
  import eventHub from '@/eventHub';
  import KeyValuePill from '@/search/pills/KeyValuePill';
  import TextPill from '@/search/pills/TextPill';
  import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
  import { Getter } from 'vuex-class';
  import { Watch } from 'vue-property-decorator';
  import {
    deepCopy,
    filterToBgraph,
  } from '@/utils/BGraphUtil';
  import { bgraph } from '@uncharted.software/bgraph';
  import { GraferLayerData } from '@uncharted.software/grafer';

  const components = {
    SearchBar,
    Settings,
    SettingsBar,
    Counters,
    Grafer,
    DrilldownPanel,
    KnowledgePreviewPane,
  };

  const DRILLDOWN_TABS: TabInterface[] = [
    { name: 'Preview', icon: '', id: 'preview' },
  ];

  @Component({ components })
  export default class DocsClusters extends Vue {
    // Initialize as undefined to prevent vue from tracking changes to the bgraph instance
    bgraphInstance: any;

    // Initialize as undefined to prevent Vue from observing changes within these large datasets
    // Grafer data is stored in Bio view data as they are required for mapping bgraph queries to grafer layers
    graferLayers: GraferLayerData[] = undefined;
    graferNodesData: Map<any, unknown> = undefined;

    // Set true when the full graph layers are rendered as background context (ie. faded)
    grafersFullGraphContextIsBackgrounded: boolean = false;
    mainGraphLoading: boolean = true;

    drilldownTabs: TabInterface[] = DRILLDOWN_TABS;
    isOpenDrilldown: boolean = false;
    drilldownActiveTabId: string = '';
    selectedData: any = {};

    @Getter getFilters;

    @Watch('getFilters') onGetFiltersChanged (): void {
      if (this.bgraphInstance) {
        const subgraph = filterToBgraph(this.bgraphInstance, this.getFilters);

        // Render subgraph as grafer query layers
        this.renderSubgraphAsGraferLayers(subgraph);
      }
    }

    onLoadedLayers (layers: any[]): void {
      this.graferLayers = layers;
    }

    async mounted (): Promise<void> {
      const [
        nodesFile,
        nodeAttsFile,
        nodeLayoutFile,
        groupsFile,
      ] = await Promise.all([
        getS3Util('research/KB/dist/wisconsin/xdd-covid-19-8Dec-doc2vec/v4.0_nonTop2Vec/nodes.jsonl'),
        getS3Util('research/KB/dist/wisconsin/xdd-covid-19-8Dec-doc2vec/v4.0_nonTop2Vec/nodeAtts.jsonl'),
        getS3Util('research/KB/dist/wisconsin/xdd-covid-19-8Dec-doc2vec/v4.0_nonTop2Vec/nodeLayout.jsonl'),
        getS3Util('research/KB/dist/wisconsin/xdd-covid-19-8Dec-doc2vec/v4.0_nonTop2Vec/groups.jsonl'),
      ]);

      const layoutInfo: LayoutInfo = {
        nodesFile,
        nodeAttsFile,
        nodeLayoutFile,
        groupsFile,
        alpha: 18.00,
        level: 1.00,
        levelCount: 4.00,
        maxLabelLength: 25.00,
        topGroupThreshold: 500.00,
        pointRadius: 20.00,
        positionScale: 50000.00,
      };
      const data = await convertDataToGraferV4(layoutInfo);

      // Store Grafer Nodes data for use in drilldown
      this.graferNodesData = new Map();
      data.nodes.forEach(n => this.graferNodesData.set(n.id, n));

      // Initialize bgraph instance
      function getBGraphNodesData (nodes: any[]) {
        nodes.forEach(n => {
          n._id = n.id;
          n._type = 'node';
        });
        return nodes;
      }
      // NOTE: getBGraphNodesData modifies data.nodes in-place
      // this could conflict with grafer data if extensive
      // modifications are made. Consider deep-copying if
      // further changes are made to in-place function.
      const bgNodes = getBGraphNodesData(data.nodes);
      this.bgraphInstance = bgraph.graph(bgNodes, []);

      eventHub.$emit('load-grafer-data', data, layoutInfo);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    renderSubgraphAsGraferLayers (subgraph: any): void {
      // Render grafer query layers
      if (!this.mainGraphLoading && this.graferLayers != null) {
        // Queries can only be sent to grafer once it has been loaded.
        // TODO: A query that is made before Grafer has been rendered will not be called again.
        //       This problem is highlighted when you have an existing query in the search bar
        //       that gets run before Grafer has had a chance to load. To avoid this issue
        //       queries must be stored or re-run once the renderer has loaded.
        const graferQueryLayerNames = ['highlightClusterLayer', 'highlightNodeLayer'];
        if (!subgraph && _.isEmpty(this.getFilters?.clauses)) {
          // Clear query layers if no results
          eventHub.$emit('remove-layers', graferQueryLayerNames);
          if (this.grafersFullGraphContextIsBackgrounded) {
            // No query layers full graph is the main context
            eventHub.$emit('foreground-full-graph');
            this.grafersFullGraphContextIsBackgrounded = false;
          }
        } else {
          const [graferQueryLayers, graferQueryLayerNames] = this.formatBGraphOutputToGraferLayers(subgraph, this.graferLayers);
          eventHub.$emit('update-layers', graferQueryLayers, graferQueryLayerNames);
          if (!this.grafersFullGraphContextIsBackgrounded) {
            // Query layer set full graph acts as background context
            eventHub.$emit('background-full-graph');
            this.grafersFullGraphContextIsBackgrounded = true;
          }
        }
      }
    }

    formatBGraphOutputToGraferLayers (
      queryResults: any[],
      layers: GraferLayerData[],
    ): [GraferLayerData[], string[]] {
      // Deep copy results to avoid mutating passed in data
      const queryResultsDeepCopy = deepCopy(queryResults);
      const queryResultsMap = new Map();
      queryResultsDeepCopy.forEach(d => {
        queryResultsMap.set(d.id, d);
      });
      const layersDeepCopy = deepCopy(layers);
      const layerNames = [];

      layersDeepCopy.forEach(layer => {
        const layerName = `${layer.name}-highlight`;
        layerNames.push(layerName);
        layer.nodes.data = layer.nodes.data.filter(node => queryResultsMap.has(node.id));
        layer.name = layerName;
      });
      return [layersDeepCopy, layerNames];
    }

    onCloseDrilldownPanel (): void {
      this.closeDrilldown();
    }

    onDrilldownTabClick (tabId: string): void {
      this.drilldownActiveTabId = tabId;
    }

    closeDrilldown (): void {
      this.isOpenDrilldown = false;
      this.drilldownActiveTabId = null;
    }

    get drilldownData (): CardInterface {
      return {
        id: 0,
        title: this.selectedData.bibjson.title,
        subtitle: this.selectedData.bibjson.journal,
        raw: this.selectedData,
      };
    }

    get searchPills (): (KeyValuePill | TextPill)[] {
      return [
        new TextPill(QUERY_FIELDS_MAP.DOCS_CLUSTERS_NODE_TITLE),
        new TextPill(QUERY_FIELDS_MAP.DOCS_CLUSTERS_NODE_DOI),
      ];
    }

    onGraferClick (detail: GraferEventDetail): void {
      // Assign node source metadata for drilldown panel
      detail = Object.assign(detail, this.graferNodesData.get(detail.id));
      detail.extras.bibjson.identifier[0].id = detail.extras.bibjson.journal;

      this.selectedData = detail.extras;
      this.isOpenDrilldown = true;
      this.drilldownActiveTabId = 'preview';
    }
  }
</script>

<style scoped>
  main {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
</style>
