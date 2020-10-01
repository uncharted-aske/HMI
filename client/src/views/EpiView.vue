<template>
  <div class="epi-view-container">
    <action-column>
      <div slot="actions">
        <action-column-nav-bar :actions="ACTIONS" :currentAction="currentAction" @set-active="onSetActive" />
      </div>
      <div slot="panel" v-if="activePane">
        <left-side-panel>
          <div slot="content">
            <facets-pane v-if="activePane === ACTIONS[0].paneId" @close="activePane = ''"/>
            <metadata-pane v-if="activePane ===  ACTIONS[1].paneId" @close="activePane = ''"/>
          </div>
        </left-side-panel>
      </div>
    </action-column>
    <search-bar />
  </div>
</template>

<script>
  import ActionColumn from '@/components/ActionColumn.vue';
  import ActionColumnNavBar from '@/components/ActionColumnNavBar.vue';
  import SearchBar from '@/components/SearchBar.vue';
  import LeftSidePanel from '@/components/LeftSidePanel.vue';
  import MetadataPane from '@/components/MetadataPane.vue';
  import FacetsPane from '@/components/FacetsPane.vue';

  const ACTIONS = [
    { name: 'Facets', icon: 'filter', paneId: 'facets' },
    { name: 'Metadata', icon: 'info', paneId: 'metadata' },
  ];

  export default {
    name: 'EpiView',
    components: {
      ActionColumn,
      ActionColumnNavBar,
      SearchBar,
      LeftSidePanel,
      MetadataPane,
      FacetsPane,
    },
    data: () => ({
      activePane: '',
    }),
    computed: {
      currentAction () {
        return this.activePane && this.ACTIONS.find(a => a.paneId === this.activePane).name;
      },
    },
    created () {
      this.ACTIONS = ACTIONS;
    },
    methods: {
      onSetActive (actionName) {
        let activePane = '';
        if (actionName !== '') {
          activePane = this.ACTIONS.find(a => a.name === actionName).paneId;
        }
        this.activePane = activePane;
      },
    },
  };
</script>

<style lang="scss" scoped>
@import "../styles/variables";

  .epi-view-container {
    height: $content-full-height;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    .btn {
      background-color: transparent;
      color: $text-color;
      width: $secondary-bar-width;
      height: $secondary-bar-width;
      position: relative;
      border: 1px solid $border;
    }
  }

</style>
