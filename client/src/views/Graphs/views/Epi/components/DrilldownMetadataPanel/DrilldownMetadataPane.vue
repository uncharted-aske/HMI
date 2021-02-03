<template>
  <div class="drilldown-metadata-pane-container">
    <div v-if="!isEmptyMetadata" >
      <collapsible-item>
        <div slot="title">Type</div>
        <div slot="content">
          <div class="metadata-item">
              {{getType}}
          </div>
        </div>
      </collapsible-item>

      <collapsible-item>
        <div slot="title">Provenance</div>
        <div slot="content">
          <div class="metadata-item">
          <div v-for="(value, key) in getProvenance" :key="key">
            <div class="key">{{key | capitalize-first-letter-formatter}}</div>
            <div v-if="key !== 'sources'">{{value}}</div>
            <div v-else>
              <div v-for="(source, key) in value[0]" :key="key">
                  {{source}}
                </div>
            </div>
          </div>
        </div>
        </div>
      </collapsible-item>

      <collapsible-item>
        <div slot="title">Attributes</div>
        <div slot="content">
        <div class="metadata-item">
          <div v-for="(item, index) in getAttributes" :key="index">
            <div v-for="(value, key) in item" :key="key">
            <div class="key">{{key | capitalize-first-letter-formatter}}</div>
              {{value}}
            </div>
          </div>
        </div>      </div>
      </collapsible-item>

      <collapsible-item>
        <div slot="title">Knowledge</div>
        <div slot="content" v-if="knowledgeResults">
          <h6 class="metadata-item">{{knowledgeSectionHeader}}</h6>
          <div v-for="(item, index) in knowledgeResultsDisplayed" :key="index" class="metadata-item">
            <div class="key">{{item.bibjson.title}}</div>
            <div v-for="(object, index) in item.children" :key="index">
              <div>{{object.content}}</div>
            </div>  
          </div>


          <!-- <div class="mt-3 flex-grow-1 position-relative overflow-hidden">
            <div class="position-absolute h-100 w-100">
              <h6>{{knowledgeSectionHeader}}</h6>
              <div v-for="(artifact) in artifactList" :key="artifact.id"
                class="shadow artifact-img"
                :style="imageStyle(artifact.bytes)"
                :title="artifact.header_content"
              />
            </div>
          </div>   -->
        </div>
      </collapsible-item>
      <!-- <div class="my-3">
        <a @click="showMoreHandler" href="/">Show more...</a>
      </div> -->


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

  import { CosmosSearchInterface, CosmosSearchObjectsInterface } from '@/types/typesCosmos';
  import { cosmosSearch, filterToParamObj } from '@/utils/CosmosFetchUtil';

  const components = {
    CollapsibleItem,
  };

  @Component({ components })
  export default class DrilldownMetadataPane extends Vue {
    @Prop({ default: null }) metadata: any;

    showModal: boolean = false;
    dataLoading = false;
    knowledgeResults: CosmosSearchInterface | Record<any, never> = {};
    knowledgeResultsDisplayed: CosmosSearchObjectsInterface[];
    knowledgeResultsCounter: number;


    get isEmptyMetadata (): boolean {
      return _.isEmpty(this.metadata);
    }

    get getType (): string {
      return !_.isEmpty(this.metadata) && this.metadata.type;
    }

    get getProvenance (): any {
      return !_.isEmpty(this.metadata) && this.metadata.provenance;
    }

    get getAttributes (): any {
      return !_.isEmpty(this.metadata) && this.metadata.attributes;
    }
    get getTextDefinition (): string {
      return (!_.isEmpty(this.metadata) && !_.isEmpty(this.metadata.attributes[0].text_definition)) && this.metadata.attributes[0].text_definition;
    }

    get knowledgeSectionHeader (): string {
      return !_.isEmpty(this.knowledgeResults) &&  `Artifacts  ${this.knowledgeResultsDisplayed.length}/${this.knowledgeResultsCounter}`;
    }

    mounted (): void {
      this.fetchCosmos();
    }

    async fetchCosmos (): Promise<void> {
      if (this.getTextDefinition) {
        try {
          this.dataLoading = true;
          const filter = { cosmosQuery: this.getTextDefinition};
          const response = await cosmosSearch(filterToParamObj(filter));
          this.knowledgeResults = response;
          this.knowledgeResultsCounter = this.knowledgeResults.total;
          this.knowledgeResultsDisplayed = response.objects.slice(0,5); //Just get the first 5 objects
          console.log(this.knowledgeResultsDisplayed);
        } catch (e) {
          throw Error(e);
        }
        this.dataLoading = false;
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.drilldown-metadata-pane-container {
  .metadata-header {
    padding: 5px;
    color: $text-color-dark;
    background-color: $drilldown-header;
  }
  .metadata-item {
    overflow-wrap: break-word;
    word-wrap: break-word;
    hyphens: auto;
    text-align: left;
    margin-top: 5px;
    padding: 5px;
    .key {
      font-weight: bold;
      padding-top: 5px;
    }
  }
  .artifact-img {
    width: 45%;
    height: 0;
    padding-top: 45%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    background-color: #EAEBEC;
    float: left;
    border: $icon-color solid 1px;
    border-radius: 10px;
    margin: 2.5%;
  }
}
</style>
