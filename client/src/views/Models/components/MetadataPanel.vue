<template>
  <div class="metadata-panel container">
    <div v-for="(datum, index) in metadata" :key="index">

      <div v-if="isTypeModel(datum)" class="Model" >
        Model - {{ datum.metadata_type }}
      </div>

      <div v-else-if="isTypeCode(datum)" class="Code">
        Code - {{ datum.metadata_type }}
      </div>

      <div v-else-if="isTypeDocuments(datum)" class="Documents">
        Documents - {{ datum.metadata_type }}
      </div>

      <aside class="provenance">
        {{ datum.provenance.method }}
        <time :datetime="datum.provenance.timestamp">
          {{ provenanceDate(datum.provenance.timestamp) }}
        </time>
      </aside>

    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import * as Model from '@/types/typesModel';
  import * as GroMET from '@/types/typesGroMEt';
  import { nicePrintableDate } from '@/utils/DateTimeUtil';

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

    provenanceDate (timestamp: string): string {
      return nicePrintableDate(timestamp);
    }
  }
</script>

<style lang="scss" scoped>
  .container {
    display: flex;
    flex-direction: column;
    gap: 3em;
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

  .provenance {
    font-size: .9em;
    font-style: italic;
    padding: .5em;
    text-align: right;

    time::before {
      content: ' — ';
    }
  }
</style>
