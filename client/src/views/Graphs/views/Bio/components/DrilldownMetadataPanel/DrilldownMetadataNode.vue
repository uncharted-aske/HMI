<template>
  <div class="drilldown-metadata-pane-container">
    <div v-if="!isEmptyMetadata">
      <collapsible-item v-for="(values, dataObjectKey) in dataObject" :key="dataObjectKey">
        <div slot="title">{{dataObjectKey}}</div>
          <div slot="content" class="my-3" v-for="(value, key) in values" :key="key">
            <div @click="onEdgeClick(value)">{{value}}{{key}}</div>
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

  import CollapsibleItem from '@/components/CollapsibleItem.vue';

  const components = {
    CollapsibleItem,
  };

  @Component({ components })
  export default class DrilldownMetadataPane extends Vue {
    @Prop({ default: null }) data: any;

    get dataObject (): Record<any, void> {
      const output: Record<any, any> = {};
      output['DB Refs'] = [];
      for (const refType in this.data.db_refs) {
        output['DB Refs'].push(`${refType}: ${this.data.db_refs[refType]}`);
      }
      output.Incoming = this.data.incoming_neighbors.slice(0, 10);
      output.Outgoing = this.data.outgoing_neighbors.slice(0, 10);
      return output;
    }

    get isEmptyMetadata (): boolean {
      return _.isEmpty(this.data);
    }

    onEdgeClick (edge: any): void {
      this.$emit('add-edge', edge);
    }
  }
</script>

<style lang="scss" scoped>
.drilldown-metadata-pane-container {
  padding: 5px;
}
</style>
