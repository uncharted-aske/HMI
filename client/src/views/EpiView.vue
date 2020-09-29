<template>
  <div class="epi-view-container">
    <action-column>
      <div slot="actions">
        <action-column-nav-bar :actions="actions" :currentActionName="''" />
      </div>
      <div slot="panel" v-if="showLeftSidePanel">
        <left-side-panel>
          <div slot="content">
            <facets-pane v-if="activePane === PANE_ID.FACETS" />
            <metadata-pane v-if="activePane ===  PANE_ID.METADATA"/>
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

  const PANE_ID = {
    METADATA: 'metadata',
    FACETS: 'facets',
  };

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
      actions: [
        { name: 'Facets', icon: 'filter' },
        { name: 'Metadata', icon: 'info' },
      ],
      activePane: '',
      showLeftSidePanel: false,
    }),
    created() {
      this.PANE_ID = PANE_ID;
    },
    methods: {
      openPane(paneId) {
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
