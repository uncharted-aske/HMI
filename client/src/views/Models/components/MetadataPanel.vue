<template>
  <div class="metadata-panel metadata-list">
    <details
      class="metadata" open
      v-for="(datum, index) in metadata" :key="index"
    >

      <template v-if="isTypeModel(datum)">
        <summary :title="datum.uid">Model</summary>
        <div class="metadata-content">
          <h6>Variables</h6>
          <p>{{ datum.variables | ArrayToList }}</p>
          <h6>Parameters</h6>
          <p>{{ datum.parameters | ArrayToList }}</p>
          <h6>Initial Conditions</h6>
          <p>{{ datum.initial_conditions | ArrayToList }}</p>
        </div>
      </template>

      <template v-else-if="isTypeCode(datum)">
        <summary :title="datum.uid">Code</summary>
        <div class="metadata-content">
          <h6>Reference</h6>
          <p>{{ datum.global_reference_id.type }} {{ datum.global_reference_id.id }}</p>
          <h6>Files</h6>
          <ol>
            <li
              v-for="(file, index) in datum.file_ids"
              :key="index"
              :title="file.uid"
            >{{ file.name }} ({{ file.path }})</li>
          </ol>
        </div>
      </template>

      <template v-else-if="isTypeDocuments(datum)">
        <summary :title="datum.uid">Documents</summary>
        <div class="metadata-content">
          <summary v-for="(doc, index) in datum.documents" :key="index" :title="doc.uid">
            <a :href="doc.bibjson.website.url">{{ doc.bibjson.title }}</a>
            {{ doc.global_reference_id.type }} {{ doc.global_reference_id.id }}
            <div type="button" class="mt-3 btn-link" @click="openModal(doc)">Show more...</div>
          </summary>
        </div>
      </template>

      <aside class="metadata-provenance">
        {{ datum.provenance.method }}
        <time :datetime="datum.provenance.timestamp">
          {{ provenanceDate(datum.provenance.timestamp) }}
        </time>
      </aside>
    </details>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import * as Model from '@/types/typesModel';
  import * as GroMET from '@/types/typesGroMEt';
  import { formatFullDateTime } from '@/utils/DateTimeUtil';

  @Component
  export default class MetadataPanel extends Vue {
    @Prop({ default: null }) metadata: Model.GraphMetadata;

    isTypeModel (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadataType.ModelInterface;
    }

    isTypeCode (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadataType.CodeCollectionReference;
    }

    isTypeDocuments (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadataType.TextualDocumentReferenceSet;
    }

    provenanceDate (timestamp: string): string {
      return formatFullDateTime(timestamp);
    }

    openModal (datum: GroMET.Metadata): void {
      this.$emit('open-modal', datum);
    }
  }
</script>
