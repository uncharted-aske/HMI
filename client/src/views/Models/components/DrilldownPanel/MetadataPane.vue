<template>
  <div class="metadata-list">
    <div v-if="isEmptyMetadata" class="alert alert-info">
      No metadata at the moment
    </div>

    <details
      class="metadata" open
      v-else
      v-for="(datum, index) in metadata" :key="index"
    >
      <template v-if="isTypeCodeSpanReference(datum)">
        <summary :title="datum.uid">Code Reference</summary>
        <div class="metadata-content">
          <h6>Type</h6>
          <p>{{ datum.code_type | capitalize-formatter }}</p>
          <h6>File</h6>
          <p>
            <a :href="datum.file_id">{{ datum.file_id }}</a><br>
            {{ sourceFilePosition(datum) }}
          </p>
        </div>
      </template>

      <template v-if="isTypeEquationDefinition(datum)">
        <summary :title="datum.uid">Equation Definition</summary>
        <div class="metadata-content">
          <h6>Number {{ datum.equation_number }}</h6>
          <p>{{ datum.document_reference_uid }}</p>

          <template v-if="datum.equation_source_latex">
            <h6>LaTeX</h6>
            <p>{{ datum.equation_source_latex }}</p>
          </template>

          <template v-if="datum.equation_source_mml">
            <h6>Math ML</h6>
            <template v-html="equationSourceMathML(datum.equation_source_mml)" />
          </template>
        </div>
      </template>

      <template v-if="isTypeTextDefinition(datum)">
        <summary :title="datum.uid">Text Definition</summary>
        <div class="metadata-content">
          <h6>XXX</h6>
        </div>
      </template>

      <template v-if="isTypeTextParameter(datum)">
        <summary :title="datum.uid">Text Parameter</summary>
        <div class="metadata-content">
          <h6>XXX</h6>
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
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import * as GroMET from '@/types/typesGroMEt';
  import { formatFullDateTime } from '@/utils/DateTimeUtil';

  const defaultCodeSpanReference: any = {
    code_type: GroMET.CodeType.Identifier,
    file_id: null,
    line_begin: null,
    line_end: null,
    col_begin: null,
    col_end: null,
  };

  @Component
  export default class MetadataPane extends Vue {
    @Prop({ default: null }) data: any[];

    /** Clean the metadata to match our expected format. */
    get metadata () : GroMET.Metadata[] {
      if (!this.data) return [];
      const cleanMetadata = this.data.map(datum => {
        return { ...defaultCodeSpanReference, ...datum };
      });
      return cleanMetadata;
    }

    get isEmptyMetadata (): boolean {
      return this.metadata.length === 0;
    }

    isTypeCodeSpanReference (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadataType.CodeSpanReference;
    }

    isTypeEquationDefinition (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadataType.EquationDefinition;
    }

    isTypeTextDefinition (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadataType.TextDefinition;
    }

    isTypeTextParameter (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadataType.TextParameter;
    }

    provenanceDate (timestamp: string): string {
      return formatFullDateTime(timestamp);
    }

    showMoreHandler (doi: string): void {
      this.$emit('open-modal', doi);
    }

    sourceFilePosition (datum: GroMET.CodeSpanReference): string {
      let lines: string, columns: string;

      if (datum.line_begin) {
        lines = `Line #${datum.line_begin}`;
      }

      if (datum.line_end) {
        lines = lines
          ? `Lines #${datum.line_begin}-${datum.line_end}`
          : `Line #${datum.line_end}`;
      }

      if (datum.col_begin) {
        columns = `Column #${datum.col_begin}`;
      }

      if (datum.col_end) {
        columns = columns
          ? `Columns #${datum.col_begin}-${datum.col_end}`
          : `Column #${datum.col_end}`;
      }

      return `${lines} ${columns}`.trim();
    }

    equationSourceMathML (mml: string): string {
      const regex = /(<math).*?(<\/math>)/g;
      return regex.exec(mml)[0] ?? null;
    }
  }
</script>
