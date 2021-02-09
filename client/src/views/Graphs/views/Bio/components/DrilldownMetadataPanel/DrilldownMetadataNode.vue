<template>
  <div class="drilldown-metadata-pane-container">
    <div v-if="!isEmptyMetadata">
      <div v-for="(value, key) in metadata" :key="key" class="metadata-item">
        <div class="key">{{key | capitalize-first-letter-formatter | underscore-remover-formatter}}</div>
        <div class="value">{{JSON.stringify(value) | remove-braces-formatter}}</div>
      <div>
      </div>
      </div>
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

  @Component
  export default class DrilldownMetadataPane extends Vue {
    @Prop({ default: null }) metadata: any;

    showModal: boolean = false;
    firstSnippet: string = FirstSnippet;
    secondSnippet: string = SecondSnippet;

    get isEmptyMetadata (): boolean {
      return _.isEmpty(this.metadata);
    }
  }
</script>

<style lang="scss" scoped>
.drilldown-metadata-pane-container {
  padding: 5px;
  .metadata-item {
    overflow-wrap: break-word;
    word-wrap: break-word;
    hyphens: auto;
    text-align: left;
    margin-top: 5px;
    .key {
      font-weight: bold;
      padding-top: 5px;
    }

    //FIXME: Put back when we have document artifacts from Cosmosonsin
    // .expression {
    //     font-family:Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New;
    // }
    // .snippet {
    //   width: 100%;
    //   height: 100px;
    //   border: 1px solid rgba(207, 216, 220, .5);
    //   margin: 5px;
    //   img {
    //       // Clip images that are too big, but maintain aspect ratio
    //       object-fit: cover;
    //       width: 100%;
    //       height: 100%
    //     }
    //   }
    }
}
</style>
