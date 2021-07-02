<template>
  <div class="metadata-list">
    <div v-if="isEmptyMetadata" class="alert alert-info" role="alert">
      No metadata at the moment
    </div>

    <details
      class="metadata" open
      v-else
      v-for="(datum, index) in metadata" :key="index"
    >

      <template>
        <summary>Type</summary>
        <div class="metadata-content">
          {{getType}}
        </div>
      </template>

      <template>
        <summary>Provenance</summary>
        <div class="metadata-content">
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
      </template>

      <template>
        <summary>Attributes</summary>
        <div class="metadata-content">
            <div v-for="(item, index) in getAttributes" :key="index">
              <div v-for="(value, key) in item" :key="key">
              <div class="key">{{key | capitalize-first-letter-formatter}}</div>
                {{value}}
              </div>
            </div>
        </div>
      </template>

      <template>
        <summary>Text Snippets</summary>
        <div class="metadata-content">
          <div v-for="(item, index) in getKnowledge" :key="index" class="snippet-container" @click="showMoreHandler(item.doi)">
            <div class="snippet-title">
              <a target="_blank" :href="item.URL">{{item.title}}</a>
            </div>
            <span v-for="(snippet, index) in item.highlight" :key="index" v-html="snippet" class="snippet-highlights"/>
          </div>
        </div>
      </template>

    </details>
  </div>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import { CosmosTextSnippet } from '@/types/typesCosmos';

  @Component
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
