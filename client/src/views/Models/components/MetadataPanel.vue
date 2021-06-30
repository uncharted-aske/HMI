<template>
  <div class="metadata-panel">
    <details v-for="(datum, index) in metadata" :key="index" open>

      <template v-if="isTypeModel(datum)">
        <summary :title="datum.uid">Model</summary>
        <span>Variables</span>
        <p>{{ datum.variables | ArrayToList }}</p>
        <span>Parameters</span>
        <p>{{ datum.parameters | ArrayToList }}</p>
        <span>Initial Conditions</span>
        <p>{{ datum.initial_conditions | ArrayToList }}</p>
      </template>

      <template v-else-if="isTypeCode(datum)">
        <summary :title="datum.uid">Code</summary>
        <span>Reference</span>
        <p>{{ datum.global_reference_id.type }} {{ datum.global_reference_id.id }}</p>
        <span>Files</span>
        <ol>
          <li
            v-for="(file, index) in datum.file_ids"
            :key="index"
            :title="file.uid"
          >{{ file.name }} ({{ file.path }})</li>
        </ol>
      </template>

      <template v-else-if="isTypeDocuments(datum)">
        <summary :title="datum.uid">Documents</summary>
        <details v-for="(doc, index) in datum.documents" :key="index">
          <summary :title="doc.uid">
            <a :href="doc.bibjson.website.url">{{ doc.bibjson.title }}</a>
            {{ doc.global_reference_id.type }} {{ doc.global_reference_id.id }}
          </summary>
          <span>File</span>
          <p><a :href="doc.bibjson.file_url">{{ doc.bibjson.file }}</a></p>
          <span>Author(s)</span>
          <p>{{ doc.bibjson.author.map(a => a.name) | ArrayToList }}</p>
        </details>
      </template>

      <aside class="provenance">
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
      return datum.metadata_type === GroMET.MetadateType.ModelInterface;
    }

    isTypeCode (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadateType.CodeCollectionReference;
    }

    isTypeDocuments (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadateType.TextualDocumentReferenceSet;
    }

    provenanceDate (timestamp: string): string {
      return formatFullDateTime(timestamp);
    }
  }
</script>

<style lang="scss" scoped>
  .metadata-panel {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 1em 0;
  }

  .metadata-panel > details {
    & > *:not(summary, .provenance) {
      padding-left: .5em;
      padding-right: .5em;
    }

    & > summary {
      background-color: var(--drilldown-header);
      font-weight: bold;
    }
  }

  details {
    border: var(--border);
    border-radius: .2em;
  }

  details > summary {
    padding: .5em;
  }

  details[open] > summary {
    border-bottom: var(--border);
    margin-bottom: .5em;
  }

  details details {
    padding: .5em;
    margin: .5em;
  }

  .provenance {
    font-size: .8em;
    font-style: italic;
    padding: .5rem;
    text-align: right;

    time { display: block; }
  }

  details > span {
    display: block;
    font-weight: bold;
    margin: 0;

    &:not(:first-of-type) {
      margin-top: 1em;
    }
  }

  ol {
    list-style-position: inside;
    list-style-type: lower-roman;
    margin: 0;
    padding: 0;
  }

  p {
    margin: 0;
  }
</style>
