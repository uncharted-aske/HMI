<template>
  <div class="drilldown-metadata-pane-container">
    <div v-if="!isEmptyMetadata">
      <collapsible-item v-for="(value, key) in dataObject" :key="key">
        <div slot="title">{{key}}</div>
        <div slot="content" class="my-3">{{value}}</div>
      </collapsible-item>
    </div>
    <div v-else class="alert alert-info" role="alert">
      No metadata at the moment
    </div>
    <!-- <modal-knowledge
      v-if="showModal"
      @close="showModal = false"
     /> -->
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

    get isEmptyMetadata (): boolean {
      return _.isEmpty(this.data);
    }

    get dataObject (): Record<any, void> {
        const output: Record<any, void> = {};
        output.Type = this.data.type;
        output.Tested = this.data.tested;
        output.Belief = this.data.belief;
        // output.Evidence = this.data.statement.evidence.map(({ text }) => text).join(', ');
        return output;
    }
  }
</script>

<style lang="scss" scoped>
  .drilldown-metadata-pane-container {
    padding: 5px;
  }
</style>
