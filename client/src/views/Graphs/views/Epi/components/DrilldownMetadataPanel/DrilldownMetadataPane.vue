<template>
  <div class="drilldown-metadata-pane-container">
    <div v-if="!isEmptyMetadata" >
      <collapsible-item>
        <div slot="title">Type</div>
        <div slot="content">
              {{getType}}
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

  const components = {
    CollapsibleItem,
  };

  @Component({ components })
  export default class DrilldownMetadataPane extends Vue {
    @Prop({ default: null }) metadata: any;

    showModal: boolean = false;

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
}
</style>
