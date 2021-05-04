<template>
  <div class="edge-pane-container">
     <div class="border-bottom">
        <h5>
          {{data.sourceLabel}} <font-awesome-icon :icon="['fas', 'long-arrow-alt-right' ]" /> {{data.targetLabel}} 
          <font-awesome-icon v-if="data.tested" :icon="['fas', 'check-circle' ]" />
        </h5>
      <h6>Type: <span class="emphasis">{{data.type}}</span> | Belief score: <span class="emphasis">{{data.belief | precision-formatter}}</span></h6>
    </div>

    <collapsible-container class="mt-3" :isEmpty="isEmptyMetadata">
      <collapsible-item class="flex-grow-1" slot="item" v-if="externalData.evidence" expanded="true">
        <div slot="title">Evidence ({{externalData.evidence.length}})</div>
        <div slot="content" class="h-100 position-absolute">
          <ul class="pl-4 h-100 overflow-auto">
            <li v-for="(evidence, index) in externalData.evidence" :key="index">{{evidence.text}}</li>
          </ul>
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
  import { emmaaEvidence } from '@/services/EmmaaFetchService';

  const components = {
    CollapsibleContainer,
    CollapsibleItem,
  };

  @Component({ components })
  export default class EdgePane extends Vue {
    @Prop({ default: null }) data: any;
    @Prop({ default: null }) model: string;
    externalData: any = {};

    @Watch('data') onDataChange (): void {
      this.fetchExternalData();
    }

    mounted (): void {
      this.fetchExternalData();
    }

    async fetchExternalData (): Promise<void> {
      this.externalData = await emmaaEvidence({
        stmt_hash: this.data.statement_id,
        source: 'model_statement',
        model: this.model,
        format: 'json',
      });
    }

    get isEmptyMetadata (): boolean {
      return _.isEmpty(this.data);
    }
  }
</script>

<style lang="scss" scoped>
  .edge-pane-container {
    padding: 5px;
  }
  .emphasis {
    font-weight: bold;
  }
</style>
