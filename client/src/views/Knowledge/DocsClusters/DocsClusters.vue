<template>
  <div class="view-container">
    <main>
      <div class="d-flex flex-column h-100">
        <div class="search-row">
          <search-bar :placeholder="`Search for documents including a specific keyword (e.g. IL-6)...`" />
        </div>
        <counters :data="{ name: 'Documents', value: 176000 }"/>
        <!-- <settings-bar>
          <div slot="right">
            <settings />
          </div>
        </settings-bar> -->
        <grafer class="grafer" layer="epi" @grafer_click="onGraferClick" />
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
  import { CardInterface, TabInterface } from '@/types/types';

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
    // drilldownData: CardInterface | Record<any, never> = {};
    selectedData: any = {};

    onCloseDrilldownPanel (): void {
      this.closeDrilldown();
    }

    onDrilldownTabClick (tabId: string): void {
      this.drilldownActiveTabId = tabId;
    }

    closeDrilldown (): void {
      this.isOpenDrilldown = false;
      // this.drilldownData = null;
      this.drilldownActiveTabId = null;
    }

    get drilldownData (): CardInterface {
      console.log('new data');
      return {
        id: 0,
        // previewImageSrc?: string,
        title: this.selectedData.bibjson.title,
        subtitle: this.selectedData.bibjson.journal,
        raw: this.selectedData,
      };
    }

    onGraferClick (x: any): void {
      this.selectedData = x.extras;
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
