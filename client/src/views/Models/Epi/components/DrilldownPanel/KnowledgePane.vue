<template>
  <div class="knowledge-pane-container">
    <div v-if="!isEmptyData" >
     <div class="mt-3 documents-container">
      <div class="mb-1 px-2 py-4 d-flex rounded-lg border" v-for="(object, index) in data.objects" :key="index">
        <div class="flex-grow-1">
            <a :href="object.bibjson.link[0].url" target="_blank">
                <h6>{{object.bibjson.title}}</h6>
            </a>
            <div> {{object.bibjson.identifier[0].id}}</div>
        </div>
      </div>
    </div>

    </div>

    <div v-else class="alert alert-info" role="alert">
      No metadata at the moment
    </div>
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import CollapsibleItem from '@/components/CollapsibleItem.vue';
  import { CosmosSearchInterface } from '@/types/typesCosmos';

  const components = {
    CollapsibleItem,
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

<style lang="scss" scoped>
@import "@/styles/variables";
.knowledge-pane-container {
display: flex;
  flex-direction: column;
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: hidden;
    .documents-container {
        overflow: hidden scroll;
    }
}

</style>
