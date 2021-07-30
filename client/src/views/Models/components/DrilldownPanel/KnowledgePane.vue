<template>
  <div class="knowledge-pane-container">
     <div v-if="!isEmptyData" class="mt-3 documents-container hide-scrollbar">
      <div class="mb-1 px-2 py-4 d-flex rounded-lg border" v-for="(object, index) in data.objects" :key="index">
        <div class="flex-grow-1">
            <a :href="object.bibjson.link[0].url" target="_blank">
                <h6>{{object.bibjson.title}}</h6>
            </a>
            <div> {{object.bibjson.identifier[0].id}}</div>
        </div>
      </div>
    </div>
    <message-display v-else>
      <span slot="message">
        No metadata at the moment.
      </span>
    </message-display>  
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import { CosmosSearchInterface } from '@/types/typesCosmos';

  import MessageDisplay from '@/components/widgets/MessageDisplay.vue';

  const components = {
    MessageDisplay,
  };

  @Component({ components })
  export default class KnowledgePane extends Vue {
    @Prop({ default: null }) data: CosmosSearchInterface;

    showModal: boolean = false;
    dataLoading = false;

    get isEmptyData (): boolean {
      return _.isEmpty(this.data);
    }

    showMoreHandler (doi: string): void {
      this.$emit('open-modal', doi);
    }
  }
</script>

<style scoped>
  .knowledge-pane-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: absolute;
    width: 100%;
  }

  .documents-container {
    overflow: hidden scroll;
  }
</style>
