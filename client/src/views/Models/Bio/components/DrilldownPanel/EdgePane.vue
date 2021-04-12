<template>
  <collapsible-container :isEmpty="isEmptyMetadata">
    <collapsible-item slot="item">
      <div slot="title">Tested</div>
      <div slot="content" class="my-3">{{externalData.tested}}</div>
    </collapsible-item>
    <collapsible-item slot="item">
      <div slot="title">Belief</div>
      <div slot="content" class="my-3">{{externalData.belief}}</div>
    </collapsible-item>
    <collapsible-item class="flex-grow-1" slot="item">
      <div slot="title">Evidence</div>
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
</style>
