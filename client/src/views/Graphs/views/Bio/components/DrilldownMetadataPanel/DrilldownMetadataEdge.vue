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

  // import ModalKnowledge from './components/ModalKnowledge/ModalKnowledge.vue';

  import FirstSnippet from '@/assets/img/SnippetKnowledge1.png';
  import SecondSnippet from '@/assets/img/SnippetKnowledge2.png';

  // FIXME: When we get document artifacts from xDD we should be able to display the modal dialog.
  // const components = {
  //   ModalKnowledge,
  // };

  import CollapsibleItem from '@/components/CollapsibleItem.vue';

  const components = {
    CollapsibleItem,
  };

  @Component({ components })
  export default class DrilldownMetadataPane extends Vue {
    @Prop({ default: null }) metadata: any;

    showModal: boolean = false;
    firstSnippet: string = FirstSnippet;
    secondSnippet: string = SecondSnippet;

    get isEmptyMetadata (): boolean {
      return _.isEmpty(this.metadata);
    }

    get dataObject (): Record<any, void> {
      const output: Record<any, void> = {};
      output.Type = this.metadata.type;
      output.Tested = this.metadata.tested;
      output.Belief = this.metadata.belief;
      output.Evidence = this.metadata.statement.evidence.map(({ text }) => text).join(', ');
      return output;
    }
  }
</script>

<style lang="scss" scoped>
  .drilldown-metadata-pane-container {
    padding: 5px;
  }
</style>
