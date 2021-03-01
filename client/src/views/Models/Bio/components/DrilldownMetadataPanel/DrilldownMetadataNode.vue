<template>
  <div class="drilldown-metadata-pane-container">
    <div v-if="!isEmptyMetadata">
      <collapsible-item v-for="(values, dataObjectKey) in dataObject" :key="dataObjectKey">
        <div slot="title">{{dataObjectKey}}</div>
        <div v-if="dataObjectKey !== 'DBRefs'">
          <div slot="content" class="mb-1 px-2 py-2 d-flex rounded-lg border" role="button" v-for="(edge, index) in values" :key="index" @click="onEdgeClick(edge)">
            {{edge.source_label}} → {{edge.target_label}}
          </div>
        </div>
        <div v-else slot="content">
          {{values}}
        </div>
      </collapsible-item>
    </div>
    <div v-else class="alert alert-info" role="alert">
      No metadata at the moment
    </div>
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import { SubgraphEdgeInterface } from '@/types/typesGraphs';

  import CollapsibleItem from '@/components/CollapsibleItem.vue';

  const components = {
    CollapsibleItem,
  };

  @Component({ components })
  export default class DrilldownMetadataPane extends Vue {
    @Prop({ default: null }) data: any;

    get dataObject (): Record<any, void> {
      const output: Record<any, any> = {};
      const dbRefs = [];
      Object.keys(this.data.db_refs).forEach(key => {
        dbRefs.push(`${key}: ${this.data.db_refs[key]}`);
      });
      output.DBRefs = dbRefs.join(',');
      output.Incoming = this.data.incoming_neighbors.slice(0, 10);
      output.Outgoing = this.data.outgoing_neighbors.slice(0, 10);
      return output;
    }

    get isEmptyMetadata (): boolean {
      return _.isEmpty(this.data);
    }

    onEdgeClick (edge: SubgraphEdgeInterface): void {
      this.$emit('add-edge', edge);
    }
  }
</script>

<style lang="scss" scoped>
.drilldown-metadata-pane-container {
  padding: 5px;
}
</style>
