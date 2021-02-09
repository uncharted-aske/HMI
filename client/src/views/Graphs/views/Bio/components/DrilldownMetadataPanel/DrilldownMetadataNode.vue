<template>
  <div class="drilldown-metadata-pane-container">
    <div v-if="!isEmptyMetadata">
      <collapsible-item v-for="(values, key) in dataObject" :key="key">
        <div slot="title">{{key}}</div>
        <div slot="content" class="my-3" v-for="(value, key) in values" :key="key">{{value}}</div>
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
      output.Name = [this.data.name];
      output['DB Refs'] = [];
      for (const refType in this.data.db_refs) {
        output['DB Refs'].push(`${refType}: ${this.data.db_refs[refType]}`);
      }
      return output;
    }

    get isEmptyMetadata (): boolean {
      return _.isEmpty(this.data);
    }
  }
</script>

<style lang="scss" scoped>
.drilldown-metadata-pane-container {
  padding: 5px;
}
</style>
