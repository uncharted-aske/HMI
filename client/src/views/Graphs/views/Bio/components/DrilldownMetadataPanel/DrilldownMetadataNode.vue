<template>
  <div class="drilldown-metadata-pane-container">
    <div v-if="!isEmptyMetadata">
      <div v-for="(value, key) in data" :key="key" class="metadata-item">
        <div class="key">{{key | capitalize-first-letter-formatter | underscore-remover-formatter}}</div>
        <div class="value">{{JSON.stringify(value) | remove-braces-formatter}}</div>
      <div>
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


  @Component
  export default class DrilldownMetadataPane extends Vue {
    @Prop({ default: null }) data: any;

    get isEmptyMetadata (): boolean {
      return _.isEmpty(this.data);
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
  }
}
</style>
