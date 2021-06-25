<template>
  <div class="metadata-panel container">
    <div v-for="(datum, index) in metadata" :key="index">

      <div v-if="isTypeModel(datum)" class="Model" >
        <h5 :title="datum.uid">Model</h5>
        <ul>
          <li>
            <h6>Variables</h6>
            {{ datum.variables.join(', ') }}
          </li>
          <li>
            <h6>Parameters</h6>
            {{ datum.parameters.join(', ') }}
          </li>
          <li>
            <h6>Initial Conditions</h6>
            {{ datum.initial_conditions.join(', ') }}
          </li>
        </ul>
      </div>

      <div v-else-if="isTypeCode(datum)" class="Code">
        <h5 :title="datum.uid">Code</h5>
        <ul>
          <li>
            <h6>Reference</h6>
            {{ datum.global_reference_id.type }} {{ datum.global_reference_id.id }}
          </li>
          <li v-for="(file, index) in datum.file_ids" :key="index" :title="file.uid">
            <h6>File {{ index }}</h6>
            {{ file.name }}: {{ file.path }}
          </li>
        </ul>
      </div>

      <div v-else-if="isTypeDocuments(datum)" class="Documents">
        <h5 :title="datum.uid">Documents</h5>
        <details v-for="(doc, index) in datum.documents" :key="index">
          <summary :title="doc.uid">{{ doc.bibjson.title }}</summary>
          <h6>Source <a :href="doc.bibjson.website.url">{{ doc.bibjson.type }}</a></h6>
          <h6>File <a :href="doc.bibjson.file_url">{{ doc.bibjson.file }}</a></h6>
          <h6>Author(s): {{ doc.bibjson.author.map(a => a.name).join(', ') }}</h6>
          <h6>Reference: {{ doc.global_reference_id.type }} {{ doc.global_reference_id.id }}</h6>
        </details>
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

  h6 {
    margin: 0;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>
