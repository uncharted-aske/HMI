<template>
  <collapsible-container :isEmpty="isEmptyMetadata">
    <collapsible-item slot="item">
      <div slot="title">Type</div>
      <div slot="content">
        <div class="metadata-item">
            {{getType}}
        </div>
      </div>
    </collapsible-item>

    <collapsible-item slot="item">
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

    <collapsible-item slot="item">
      <div slot="title">Attributes</div>
      <div slot="content">
        <div class="metadata-item">
          <div v-for="(item, index) in getAttributes" :key="index">
            <div v-for="(value, key) in item" :key="key">
            <div class="key">{{key | capitalize-first-letter-formatter}}</div>
              {{value}}
            </div>
          </div>
        </div>
      </div>
    </collapsible-item>

    <collapsible-item slot="item" class="flex-grow-1">
      <div slot="title">Text Snippets</div>
      <div slot="content" class="h-100 position-absolute">
        <div v-for="(item, index) in getKnowledge" :key="index" class="snippet-container" @click="showMoreHandler(item.doi)">
          <div class="snippet-title">
            <a target="_blank" :href="item.URL">{{item.title}}</a>
          </div>
          <span v-for="(snippet, index) in item.highlight" :key="index" v-html="snippet" class="snippet-highlights"/>
        </div>
      </div>
    </collapsible-item>

    <div slot="empty" class="alert alert-info" role="alert">
      No metadata at the moment
    </div>
  </collapsible-container>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import CollapsibleContainer from '@/components/Collapsible/CollapsibleContainer.vue';
  import CollapsibleItem from '@/components/Collapsible/CollapsibleItem.vue';
  import { CosmosTextSnippet } from '@/types/typesCosmos';

  const components = {
    CollapsibleContainer,
    CollapsibleItem,
  };

  @Component({ components })
  export default class MetadataPane extends Vue {
    @Prop({ default: null }) data: any;

    showModal: boolean = false;
    dataLoading = false;

    get isEmptyMetadata (): boolean {
      return _.isEmpty(this.data);
    }

    get getType (): string {
      return !_.isEmpty(this.data) && this.data.type;
    }

    get getProvenance (): any {
      return !_.isEmpty(this.data) && this.data.provenance;
    }

    get getAttributes (): any {
      return !_.isEmpty(this.data) && this.data.attributes;
    }

    get getTextDefinition (): string {
      return (!_.isEmpty(this.data) && !_.isEmpty(this.data.attributes[0].text_definition)) && this.data.attributes[0].text_definition;
    }

    get getKnowledge (): CosmosTextSnippet[] {
      return !_.isEmpty(this.data) && this.data.knowledge && this.data.knowledge.map(d => _.pick(d, ['doi', 'title', 'URL', 'highlight', 'doi']));
    }

    showMoreHandler (doi: string): void {
      this.$emit('open-modal', doi);
    }
  }
</script>

<style scoped>
  .metadata-item {
    overflow-wrap: break-word;
    word-wrap: break-word;
    hyphens: auto;
    text-align: left;
    margin-top: 5px;
    padding: 5px;
  }

  .metadata-item .key {
    font-weight: bold;
    padding-top: 5px;
  }

  .snippet-container {
    height: 100%;
    overflow: auto;
    border: var(--border);
    padding: 4px 8px;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    cursor: pointer;
  }

  .snippet-highlights {
    font-size: 14px;
  }

  .snippet-highlights em {
    font-weight: bold;
  }
</style>
