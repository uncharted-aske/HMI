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
        <div slot="title">Text Snippets</div>
        <div slot="content" class="knowledge-container">
          <div v-for="(item, index) in getKnowledge" :key="index" class="snippet-container" @click="showMoreHandler(item.doi)">
            <div class="snippet-title">
              <a target="_blank" :href="item.URL">{{item.title}}</a>
            </div>
            <span v-for="(snippet, index) in item.highlight" :key="index" v-html="snippet" class="snippet-highlights"/>
          </div>
        </div>
      </collapsible-item>
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
  import { CosmosTextSnippet } from '@/types/typesCosmos';

  const components = {
    CollapsibleItem,
  };

  @Component({ components })
  export default class DrilldownMetadataPane extends Vue {
    @Prop({ default: null }) metadata: any;

    showModal: boolean = false;
    dataLoading = false;

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

    get getKnowledge (): CosmosTextSnippet[] {
      return !_.isEmpty(this.metadata) && this.metadata.knowledge && this.metadata.knowledge.map(d => _.pick(d, ['doi', 'title', 'URL', 'highlight', 'doi']));
    }

    showMoreHandler (doi: string): void {
      this.$emit('open-modal', doi);
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

  .knowledge-container {
    display: flex;
    flex-direction: column;
    height: 50vh;
    overflow:hidden;
    .snippet-container {
      flex: 1;
      overflow: auto;
      border: 1px solid $border;
      padding: 4px 8px;
      box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
      cursor: pointer;
      .snippet-highlights {
        font-size: 14px;
        em {
          font-weight: bold;
        }
      }
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
