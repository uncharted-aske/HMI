<template>
  <div class="drilldown-metadata-pane-container">
    <div v-if="!isEmptyMetadata">
      <collapsible-item key="tested">
        <div slot="title">Tested</div>
        <div slot="content" class="my-3">{{data.tested}}</div>
      </collapsible-item>
      <collapsible-item key="belief">
        <div slot="title">Belief</div>
        <div slot="content" class="my-3">{{data.belief}}</div>
      </collapsible-item>
      <collapsible-item key="evidence">
        <div slot="title">Evidence</div>
        <div slot="content" class="my-3">
          <ul class="pl-4">
            <li v-for="(evidence, index) in data.evidence" :key="index">{{evidence.text}}</li>
          </ul>
        </div>
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
  }
</script>

<style lang="scss" scoped>
  .drilldown-metadata-pane-container {
    padding: 5px;
  }
</style>
