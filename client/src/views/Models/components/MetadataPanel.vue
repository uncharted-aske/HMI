<template>
  <div class="container">
    <div v-for="(datum, index) in metadata" :key="index">
      <template v-if="isTypeModel(datum)">Model - {{ datum.metadata_type }}</template>
      <template v-else-if="isTypeCode(datum)">Code - {{ datum.metadata_type }}</template>
      <template v-else-if="isTypeDocuments(datum)">Documents - {{ datum.metadata_type }}</template>
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import * as Model from '@/types/typesModel';
  import * as GroMET from '@/types/typesGroMEt';

  @Component
  export default class MetadataPanel extends Vue {
    @Prop({ default: null }) metadata: Model.GraphMetadata;

    isTypeModel (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadateType.ModelInterface;
    }

    isTypeCode (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadateType.CodeCollectionReference;
    }

    isTypeDocuments (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadateType.TextualDocumentReferenceSet;
    }
  }
</script>

<style lang="scss" scoped>
  .container {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 1em;
  }

  .metadata-item {
    padding: 20px;
    text-align: left;
    border-bottom: 1px solid rgba(207, 216, 220, .5);
    .key {
      font-weight: bold;
      padding-top: 5px;
    }
  }
</style>
