<template>
  <div class="edge-pane-container">
    <header>
      <h5>
        {{ data.sourceLabel }}
        <font-awesome-icon :icon="['fas', 'long-arrow-alt-right']" />
        {{ data.targetLabel }}
        <font-awesome-icon v-if="data.curated === 1" :icon="['fas', 'check-circle']" />
      </h5>
      Type: {{ data.statement_type }}<br>
      Belief score: {{ data.belief | precision-formatter }}
    </header>

    <div class="metadata-list">
      <loading-alert v-if="isLoading" />

      <details v-if="hasEdgeEvidences" class="metadata" open>
        <summary>Evidence ({{ edgeEvidences.length }})</summary>
        <div class="metadata-content">
          <figure
            v-for="(edgeEvidence, index) in edgeEvidences"
            :key="index"
            @click="onClickEvidence(edgeEvidence.evidence)"
          >
            {{ excerpt(edgeEvidence.evidence) }}
            <figcaption>
              {{ caption(edgeEvidence.artifact) }}
               <font-awesome-icon class="icon" :icon="['fas', 'book']" />
            </figcaption>
          </figure>
        </div>
      </details>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';

  import LoadingAlert from '@/components/widgets/LoadingAlert.vue';

  import { getAuthorList } from '@/utils/CosmosDataUtil';
  import { truncateString } from '@/utils/StringUtil';

  import { cosmosArtifactsMem } from '@/services/CosmosFetchService';
  import { emmaaEvidence } from '@/services/EmmaaFetchService';

  import * as COSMOS from '@/types/typesCosmos';
  import * as EMMAA from '@/types/typesEmmaa';
  import * as GRAPHS from '@/types/typesGraphs';

  const components = {
    LoadingAlert,
  };

  /** Local type to handle EMMAA Evidence and COSMOS artifact. */
  type EdgeEvidence = {
    artifact: COSMOS.CosmosArtifactInterface,
    evidence: EMMAA.EmmaaEvidenceEvidenceInterface,
  }

  @Component({ components })
  export default class EdgePane extends Vue {
    @Prop({ default: null }) data: GRAPHS.GraphNodeDataInterface;
    @Prop({ default: null }) model: string;
    isLoading = false;
    edgeEvidences: EdgeEvidence[] = [];

    @Watch('data') onDataChange (): void {
      this.fetchExternalData();
    }

    mounted (): void {
      this.fetchExternalData();
    }

    get hasEdgeEvidences (): boolean {
      return this.edgeEvidences.length > 0;
    }

    async fetchExternalData (): Promise<void> {
      this.isLoading = true;
      this.edgeEvidences = [];

      const resultEmmaaEvidence = await emmaaEvidence({
        stmt_hash: this.data.statement_id,
        source: 'model_statement',
        model: this.model,
        format: 'json',
      });

      if (resultEmmaaEvidence.evidence) {
        this.edgeEvidences = await Promise.all(resultEmmaaEvidence.evidence.map(async (evidence) => {
          const args = { doi: evidence.text_refs.DOI };
          const artifact = await cosmosArtifactsMem(args);
          return { artifact, evidence };
        })) as EdgeEvidence[];
      }

      this.isLoading = false;
    }

    caption (artifact: COSMOS.CosmosArtifactInterface): string {
      if (artifact.bibjson) {
        const title = truncateString(artifact.bibjson.title, 50);
        const authorList = truncateString(getAuthorList(artifact.bibjson), 50);
        const timestamp = artifact.bibjson?.year?.toString();
        return [title, authorList, timestamp].filter(Boolean).join(' - ');
      }
    }

    excerpt (evidence: EMMAA.EmmaaEvidenceEvidenceInterface): string {
      return truncateString(evidence.text, 500);
    }

    onClickEvidence (evidence: EMMAA.EmmaaEvidenceEvidenceInterface): void {
      this.$emit('evidence-click', evidence.text_refs.DOI);
    }
  }
</script>

<style scoped>
  figure {
    border: var(--border-light);
    cursor: pointer;
    font-size: .9em;
    margin: .5em 0;
    padding: .5rem;
  }

  figure:hover {
    border-color: var(--selection-dark);
  }

  figcaption {
    color: var(--text-color-panel-muted);
    font-style: italic;
    margin-top: .5em;
    text-align: right;
  }

  .icon {
    margin-left: .5em;
  }

  .fa-check-circle {
    color: var(--curation-correct);
  }
</style>
