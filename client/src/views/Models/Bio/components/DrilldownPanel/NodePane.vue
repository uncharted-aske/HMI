<template>
  <collapsible-container :isEmpty="isEmptyMetadata">
    <collapsible-item slot="item" v-for="(values, dataObjectKey) in dataObject" :key="dataObjectKey">
      <div slot="title">{{dataObjectKey}}</div>
      <div slot="content" v-if="dataObjectKey === 'Evidence'">
        <a :href="values">{{dbRef.namespace}}</a>
      </div>
      <div slot="content" v-else>
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
  import { Prop, Watch } from 'vue-property-decorator';

  import CollapsibleContainer from '@/components/Collapsible/CollapsibleContainer.vue';
  import CollapsibleItem from '@/components/Collapsible/CollapsibleItem.vue';

  import { emmaaEntityInfo } from '@/services/EmmaaFetchService';

  import { EmmaaEntityInfoInterface } from '@/types/typesEmmaa';
  import { GraphNodeDataInterface } from '@/types/typesGraphs';

  const components = {
    CollapsibleContainer,
    CollapsibleItem,
  };

  @Component({ components })
  export default class NodePane extends Vue {
    @Prop({ default: null }) data: GraphNodeDataInterface;
    @Prop({ default: null }) model: any;
    externalData: EmmaaEntityInfoInterface;
    dataObject: Record<any, any> = {};

    @Watch('data') async onDataChange (): Promise<void> {
      this.dataObject = this.computeDataObject();
      this.fetchExternalData();
    }

    mounted (): void {
      this.dataObject = this.computeDataObject();
      this.fetchExternalData();
    }

    get dbRef (): { namespace: string, id: string } {
      const dbRefPriority = this.data.db_ref_priority.indexOf(':');
      return {
        namespace: this.data.db_ref_priority.slice(0, dbRefPriority),
        id: this.data.db_ref_priority.slice(dbRefPriority + 1),
      };
    }

    async fetchExternalData (): Promise<void> {
      const response = await emmaaEntityInfo({
        modelName: this.model,
        ...this.dbRef,
      });
      this.externalData = response;
      this.dataObject = this.computeDataObject();
    }

    computeDataObject (): Record<any, void> {
      const { data, externalData } = this;
      const output: Record<any, any> = {};
      if (externalData) {
        output.Definition = externalData.definition;
        output.Evidence = externalData.url;
      }
      output.Incoming = data.in_degree;
      output.Outgoing = data.out_degree;
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
