<template>
  <div class="epi-view-container">
    <action-column>
      <div slot="actions">
        <action-column-nav-bar :actions="ACTIONS" :currentActionName="''" />
      </div>
      <div slot="panel" v-if="showLeftSidePanel">
        <left-side-panel>
          <div slot="content">
            <facets-pane v-if="activePane === LEFT_PANE_ID.FACETS" />
            <metadata-pane v-if="activePane ===  LEFT_PANE_ID.METADATA"/>
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

  const LEFT_PANE_ID = {
    METADATA: 'metadata',
    FACETS: 'facets',
  };

  const ACTIONS =  [
        { name: 'Facets', icon: 'filter' },
        { name: 'Metadata', icon: 'info' },
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
      showLeftSidePanel: false,
    }),
    created () {
      this.LEFT_PANE_ID = LEFT_PANE_ID;
      this.ACTIONS = ACTIONS;
    },
    methods: {
      openPane (paneId) {
        this.showLeftSidePanel = !this.showLeftSidePanel;
        if (this.showLeftSidePanel) {
          this.activePane = paneId;
          console.log(this.activePane);
        }
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
