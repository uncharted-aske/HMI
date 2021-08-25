<template>
  <div class="metadata-list">
    <message-display v-if="isEmptyMetadata" class="m-3">
      No metadata at the moment.
    </message-display>
    <loading-alert v-if="isLoading" />
    <details
      class="metadata" open
      v-else
      v-for="(datum, index) in sortedMetadata" :key="index"
    >
      <template v-if="isTypeDomain(datum)">
        <summary :title="datum.uid">
          Domain
        </summary>
        <div class="metadata-content">
          <p>Data type: {{ datum.data_type }} Scale: {{ datum.measurement_scale }}</p>
        </div>
      </template>

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
              <li v-if="!datum.text_spans">{{ textExtraction(datum) }}</li>
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

      <template v-if="isTypeEquationParameter(datum)">
        <summary>Equation Parameter</summary>
        <div class="metadata-content">
          <p>{{ datum.value }}</p>
          <p>{{ datum.variable_identifier }}</p>
          <h6>Number {{ datum.equation_extraction.equation_number }}</h6>
          <p>{{ datum.equation_extraction.document_reference_uid }}</p>
          <p>{{ datum.equation_extraction.source_type }}</p>

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

      <template v-if="isTypeIndraAgentReferenceSet(datum)">
        <summary :title="datum.uid">Agent(s) Reference(s)</summary>
        <div class="metadata-content"  v-for="(reference, index) in agentsReferences" :key="index">
           <details class="metadata" open>
            <summary>
              <p v-if="reference.name">{{ reference.name }}</p>
              <a v-if="reference.url" :href="reference.url">
              {{ formatUrl(reference.url) }}
              </a>
            </summary>
            <div v-if="reference.definition" class="metadata-content">
              <p>{{ reference.definition }}</p>
            </div>
            <div v-else class="metadata-content">
              No definition.
            </div>
          </details>
        </div>
      </template>

      <template v-if="isTypeReactionReference(datum)">
        <summary :title="datum.uid">Reaction Reference(s)</summary>
        <div v-if="nodeStatement" class="metadata-content">
          <template v-if="nodeStatement.type">
            <h6>Type</h6>
            <p>{{ nodeStatement.type }}</p>
          </template>
          <template v-if="nodeStatement.belief">
            <h6>Belief score</h6>
            <p>{{ nodeStatement.belief }}</p>
          </template>
          <details v-if="nodeStatement" class="metadata" open>
            <summary v-if="nodeStatement.evidence">Evidence ({{nodeStatement.evidence.length}})</summary>
            <div v-if="nodeStatement.evidence" class="metadata-content">
              <figure
                v-for="(evidence, index) in nodeStatement.evidence"
                :key="index"
              >
                  <span v-if="evidence.text">
                    {{ excerpt(evidence) }}
                  </span>
              </figure>
            </div>
          </details>
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
  import { Prop, Watch } from 'vue-property-decorator';
  import _ from 'lodash';

  import { emmaaEntityInfo, emmaaEvidence } from '@/services/EmmaaFetchService';

  import { truncateString } from '@/utils/StringUtil';

  import * as GroMET from '@/types/typesGroMEt';
  import * as EMMAA from '@/types/typesEmmaa';

  import { formatFullDateTime } from '@/utils/DateTimeUtil';
  import MessageDisplay from '@/components/widgets/MessageDisplay.vue';
  import LoadingAlert from '@/components/widgets/LoadingAlert.vue';

  const METADATA_TYPES_ORDER = [
    GroMET.MetadataType.TextDefinition,
    GroMET.MetadataType.Domain,
    GroMET.MetadataType.TextParameter,
    GroMET.MetadataType.EquationDefinition,
    GroMET.MetadataType.CodeSpanReference,
    GroMET.MetadataType.IndraAgentReferenceSet,
    GroMET.MetadataType.ReactionReference,
  ];

  const components = {
    MessageDisplay,
    LoadingAlert,
  };

  @Component({ components })
  export default class MetadataPane extends Vue {
    @Prop({ default: [] }) metadata: GroMET.Metadata[];
    @Prop({ default: '' }) modelName: string;

    isLoading = false;
    agentsReferences: EMMAA.EmmaaEntityInfoInterface[] = [];
    nodeStatement: EMMAA.EmmaaEvidenceInterface = null;

    @Watch('metadata') onDataChange (): void {
      if (this.metadata.find(this.isTypeIndraAgentReferenceSet)) {
        this.fetchAgentsReferences();
      }
      if (this.metadata.find(this.isTypeReactionReference)) {
        this.fetchNodeEvidences();
      }
    }

    mounted (): void {
      if (this.metadata.find(this.isTypeIndraAgentReferenceSet)) {
        this.fetchAgentsReferences();
      }
      if (this.metadata.find(this.isTypeReactionReference)) {
        this.fetchNodeEvidences();
      }
    }

    get sortedMetadata (): GroMET.Metadata[] {
      return [...this.metadata].sort((a, b) => {
        const indexA = METADATA_TYPES_ORDER.indexOf(a.metadata_type);
        const indexB = METADATA_TYPES_ORDER.indexOf(b.metadata_type);
        return indexA - indexB;
      });
    }

    get isEmptyMetadata (): boolean {
      return this.metadata?.length === 0 || this.metadata === [];
    }

    isTypeCodeSpanReference (datum: any): boolean {
      return datum.metadata_type === GroMET.MetadataType.CodeSpanReference || datum.type === "CODE_SPAN_REFERENCE";
    }

    isTypeEquationDefinition (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadataType.EquationDefinition;
    }

    isTypeEquationParameter (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadataType.EquationParameter || datum.type === GroMET.MetadataType.EquationParameter;
    }
    
    // eslint-disable-next-line
    isTypeTextDefinition (datum: any): boolean {
      return datum.metadata_type === GroMET.MetadataType.TextDefinition || datum.type === "TEXT_DEFINITION";
    }

    isTypeTextParameter (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadataType.TextParameter;
    }

    isTypeText (datum: GroMET.Metadata): boolean {
      return this.isTypeTextDefinition(datum) ||
        this.isTypeTextParameter(datum);
    }

    isTypeDomain (datum: GroMET.Metadata): boolean {
      return datum.type === GroMET.MetadataType.Domain
    }

    isTypeIndraAgentReferenceSet (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadataType.IndraAgentReferenceSet;
    }

    isTypeReactionReference (datum: GroMET.Metadata): boolean {
      return datum.metadata_type === GroMET.MetadataType.ReactionReference;
    }

    provenanceDate (timestamp: string): string {
      return formatFullDateTime(timestamp);
    }

    showMoreHandler (doi: string): void {
      this.$emit('open-modal', doi);
    }

    async fetchAgentsReferences (): Promise<void> {
      this.isLoading = true;
      this.agentsReferences = [];

      this.agentsReferences = await Promise.all((this.metadata[0] as GroMET.IndraAgentReferenceSet)
       .indra_agent_references.map(async (reference) => {
        const args = { modelName: this.modelName, namespace: Object.keys(reference.db_refs)[0], id: Object.values(reference.db_refs)[0] };
        const response = await emmaaEntityInfo(args as any);
         return response;
        }));
      this.isLoading = false;
    }

     async fetchNodeEvidences (): Promise<void> {
      this.isLoading = true;

      const statementId = (this.metadata[0] as GroMET.ReactionReference).indra_stmt_hash;
      this.nodeStatement = await emmaaEvidence({
        stmt_hash: Number(statementId),
        source: 'model_statement',
        model: this.modelName,
        format: 'json',
      });

      this.isLoading = false;
    }

    formatUrl (url: string): string {
      if (url) {
        const slicedUrl = url.split('/');
        return slicedUrl[slicedUrl.length - 1];
      }
    }

    excerpt (evidence: EMMAA.EmmaaEvidenceEvidenceInterface): string {
      if (evidence && evidence.text) {
        return truncateString(evidence.text, 500);
      }
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
