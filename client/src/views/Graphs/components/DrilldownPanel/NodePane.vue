<template>
  <div class="node-pane-container">
     <div class="border-bottom">
        <h5>{{data.label}}
        </h5>
      <h6>Type: <span class="emphasis">{{data.type}}</span></h6>
    </div>

  <collapsible-container :isEmpty="isEmptyMetadata">
    <collapsible-item slot="item" expanded="true" v-for="(values, dataObjectKey) in dataObject" :key="dataObjectKey">
      <div slot="title">{{dataObjectKey}}</div>
      <div slot="content" v-if="dataObjectKey === 'URL'">
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
</div>
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

    @Watch('data') onDataChange (): void {
      this.dataObject = this.computeDataObject();
      this.fetchExternalData();
    }

    mounted (): void {
      this.dataObject = this.computeDataObject();
      this.fetchExternalData();
    }

    get dbRef (): { namespace: string, id: string } {
      return this.data.db_ids[0];
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
        output.URL = externalData.url;
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

<style scoped>
  .node-pane-container {
    padding: 5px;
  }
</style>
