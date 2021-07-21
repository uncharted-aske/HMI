<template>
  <div class="view-container">
    <main>
      <div class="d-flex flex-column h-100">
        <div class="search-row">
          <search-bar :placeholder="`Search for documents including a specific keyword (e.g. IL-6)...`" />
        </div>
        <settings-bar>
          <counters slot="left" :data="[{ name: 'Documents', value: 176000 }]"/>
        </settings-bar>
        <grafer class="grafer" layer="epi" data="info" @grafer_click="onGraferClick" />
      </div>
    </main>
    <drilldown-panel :tabs="drilldownTabs" :is-open="isOpenDrilldown" :active-tab-id="drilldownActiveTabId" @close-pane="onCloseDrilldownPanel" @tab-click="onDrilldownTabClick">
      <knowledge-preview-pane v-if="drilldownActiveTabId === 'preview'" slot="content" :data="drilldownData" @open-modal="showModalDocuments = true"/>
    </drilldown-panel>
  </div>
</template>

<script lang="ts">
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
    drilldownTabs: TabInterface[] = DRILLDOWN_TABS;
    isOpenDrilldown: boolean = false;
    drilldownActiveTabId: string = '';
    selectedData: any = {};

    graferNodesData: any = undefined;

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

      eventHub.$emit('load-grafer-data', data, layoutInfo);
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
