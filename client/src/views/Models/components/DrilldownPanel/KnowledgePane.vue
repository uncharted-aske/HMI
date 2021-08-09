<template>
  <div class="knowledge-pane-container">
     <div v-if="!isEmptyData" class="mt-3 documents-container hide-scrollbar">
      <div class="mb-1 px-2 py-4 d-flex rounded-lg border" v-for="(object, index) in data.objects" :key="index">
        <div class="flex-grow-1">
            <div type="button" class="btn-link" @click="openModal(index)">
                <h6>{{object.bibjson.title}}</h6>
            </div>
            <div> {{object.bibjson.identifier[0].id}}</div>
        </div>
      </div>
    </div>
    <message-display v-else class="m-3">
      <span slot="message">
        No metadata at the moment.
      </span>
    </message-display>
    <modal-document
      v-if="showModal"
      :data="modalData"
      @close="showModal = false"
    />
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import { CosmosSearchInterface, CosmosSearchObjectsInterface } from '@/types/typesCosmos';

  import MessageDisplay from '@/components/widgets/MessageDisplay.vue';
  import ModalDocument from '@/components/Modals/ModalDocument.vue';

  const components = {
    MessageDisplay,
    ModalDocument,
  };

  @Component({ components })
  export default class KnowledgePane extends Vue {
    @Prop({ default: null }) data: CosmosSearchInterface;

    showModal: boolean = false;
    modalData: CosmosSearchObjectsInterface = null;
    dataLoading = false;

    get isEmptyData (): boolean {
      return _.isEmpty(this.data.objects) || Boolean(this.data.error);
    }

    openModal (index: number): void {
      this.showModal = true;
      this.modalData = this.data.objects[index];
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
