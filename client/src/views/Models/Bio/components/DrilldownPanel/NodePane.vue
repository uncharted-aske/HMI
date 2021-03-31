<template>
  <collapsible-container :isEmpty="isEmptyMetadata">
    <collapsible-item slot="item" v-for="(values, dataObjectKey) in dataObject" :key="dataObjectKey">
      <div slot="title">{{dataObjectKey}}</div>
      <div slot="content">
        {{values}}
      </div>
    </collapsible-item>

    <div slot="empty" class="alert alert-info" role="alert">
      No metadata at the moment
    </div>
  </collapsible-container>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import CollapsibleContainer from '@/components/Collapsible/CollapsibleContainer.vue';
  import CollapsibleItem from '@/components/Collapsible/CollapsibleItem.vue';

  const components = {
    CollapsibleContainer,
    CollapsibleItem,
  };

  @Component({ components })
  export default class NodePane extends Vue {
    @Prop({ default: null }) data: any;

    get dataObject (): Record<any, void> {
      const output: Record<any, any> = {};
      const dbRefs = [];
      Object.keys(this.data.db_refs).forEach(key => {
        dbRefs.push(`${key}: ${this.data.db_refs[key]}`);
      });
      output.DBRefs = dbRefs.join(',');
      return output;
    }

    get isEmptyMetadata (): boolean {
      return _.isEmpty(this.data);
    }
  }
</script>

<style lang="scss" scoped>
.node-pane-container {
  padding: 5px;
}
</style>
