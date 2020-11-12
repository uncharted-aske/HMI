<template>
  <div class="drilldown-metadata-pane-container" v-if="metadata">
    <div v-for="(value, key) in metadata" :key="key" class="metadata-item">
      <div v-if="key !== 'knowledge'">
        <div class="key" v-if="key !== 'knowledge'"> {{key | capital-letters-formatter | underscore-remover-formatter}} </div>
        <div :class="{'expression': key === 'expression' || key === 'eqn_source', '': key !== 'expression' || key !== 'eqn_source' }">{{value}} </div>
      </div>
     <div v-else>
       <div class="key"> {{key | capital-letters-formatter | underscore-remover-formatter}} (2) </div>
       <div class="snippet" @click="showModal = true">
        <img :src="firstSnippet" />
       </div>
       <div class="snippet" @click="showModal = true"> <img :src="secondSnippet" /></div>
     </div>
    </div>
    <modal-knowledge
      v-if="showModal"
      @close="showModal = false"
     />
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import ModalKnowledge from './components/ModelKnowledge/ModalKnowledge.vue';

  import FirstSnippet from '@/assets/img/SnippetKnowledge1.png';
  import SecondSnippet from '@/assets/img/SnippetKnowledge2.png';

  const components = {
    ModalKnowledge,
  };

  @Component({ components })
  export default class DrilldownMetadataPane extends Vue {
    @Prop({ default: null }) metadata: any;

    showModal: boolean = false;
    firstSnippet: string = FirstSnippet;
    secondSnippet: string = SecondSnippet;
  }
</script>

<style lang="scss" scoped>
.metadata-item {
  text-align: left;
  margin-top: 5px;
  .key {
    font-weight: bold;
    padding-top: 5px;
  }
  .expression {
      font-family:Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New;
  }
  .snippet {
    width: 100%;
    height: 100px;
    border: 1px solid rgba(207, 216, 220, .5);
    margin: 5px;
     img {
        // Clip images that are too big, but maintain aspect ratio
        object-fit: cover;
        width: 100%;
        height: 100%
      }
  }
}
</style>
