<template>
  <div class="metadata-list">
    <message-display v-if="isEmptyMetadata" class="m-3">
      <span slot="message">
        No metadata at the moment.
      </span>
    </message-display>
    <details
      class="metadata" open
      v-else
      v-for="(datum, index) in sortedMetadata" :key="index"
    >
      <template v-if="isTypeText(datum)">
        <summary :title="datum.uid">
          Text {{ isTypeTextParameter(datum) ? 'Parameter' : 'Definition' }}
        </summary>
        <div class="metadata-content">
          <template v-if="datum.variable_identifier">
            <h6>Variable {{ datum.variable_identifier }}</h6>
            <p>{{ isTypeTextParameter(datum) ? datum.value : datum.variable_definition }}</p>
          </template>
          <template v-if="datum.text_extraction">
            <h6>Reference</h6>
            <ul>
              <li>{{ datum.text_extraction.document_reference_uid }}</li>
              <li>{{ textExtraction(datum) }}</li>
            </ul>
          </template>
        </div>
      </template>

      <template v-if="isTypeEquationDefinition(datum)">
        <summary :title="datum.uid">Equation Definition</summary>
        <div class="metadata-content">
          <h6>Number {{ datum.equation_extraction.equation_number }}</h6>
          <p>{{ datum.equation_extraction.document_reference_uid }}</p>

          <template v-if="datum.equation_extraction.equation_source_mml">
            <h6>Math ML</h6>
            <div v-html="equationSourceMathML(datum.equation_extraction.equation_source_mml)" />
          </template>

          <template v-if="datum.equation_extraction.equation_source_latex">
            <h6>LaTeX</h6>
            <pre>{{ datum.equation_extraction.equation_source_latex }}</pre>
          </template>
        </div>
      </template>

      <template v-if="isTypeCodeSpanReference(datum)">
        <summary :title="datum.uid">Code Reference</summary>
        <div class="metadata-content">
          <template v-if="datum.code_type">
            <h6>Type</h6>
            <p>{{ datum.code_type | capitalize-formatter }}</p>
          </template>

          <template v-if="datum.file_id">
            <h6>File</h6>
            <p>
              <a :href="datum.file_id">{{ datum.file_id }}</a><br>
              {{ sourceFilePosition(datum) }}
            </p>
          </template>
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
  import _ from 'lodash';

  import * as GroMET from '@/types/typesGroMEt';
  import { formatFullDateTime } from '@/utils/DateTimeUtil';
  
  import MessageDisplay from '@/components/widgets/MessageDisplay.vue';

  const METADATA_TYPES_ORDER = [
    GroMET.MetadataType.TextDefinition,
    GroMET.MetadataType.TextParameter,
    GroMET.MetadataType.EquationDefinition,
    GroMET.MetadataType.CodeSpanReference,
  ];

  const components = {
    MessageDisplay,
  };

  @Component({ components })
  export default class MetadataPane extends Vue {
    @Prop({ default: [] }) metadata: GroMET.Metadata[];

    get sortedMetadata (): GroMET.Metadata[] {
      return [...this.metadata].sort((a, b) => {
        const indexA = METADATA_TYPES_ORDER.indexOf(a.metadata_type);
        const indexB = METADATA_TYPES_ORDER.indexOf(b.metadata_type);
        return indexA - indexB;
      });
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

    isTypeText (datum: GroMET.Metadata): boolean {
      return this.isTypeTextDefinition(datum) ||
        this.isTypeTextParameter(datum);
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

    textExtraction (datum: GroMET.TextDefinition | GroMET.TextParameter): string {
      const text = datum.text_extraction;
      let result = '';

      if (_.isNumber(text.page)) {
        result += ` Page #${text.page}`;
      }

      if (_.isNumber(text.block)) {
        result += ` Block #${text.block}`;
      }

      if (_.isNumber(text.char_begin) && _.isNumber(text.char_end)) {
        result += ` Chars #${text.char_begin}-${text.char_end}`;
      } else if (_.isNumber(text.char_begin) || _.isNumber(text.char_end)) {
        result += ` Char #${text.char_begin ?? text.char_end}`;
      }

      return result.trim();
    }

    equationSourceMathML (mml: string): string {
      const regex = /(<math).*?(<\/math>)/g;
      return regex.exec(mml)[0] ?? null;
    }
  }
</script>
