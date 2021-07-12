<template>
  <div class="knowledge-preview-pane-container">
    <div class="border-bottom">
      <a :href="data.raw.bibjson.link[0].url" target="_blank">
        <h5>{{data.title}}</h5>
      </a>
      <h6>{{doi}}</h6>
    </div>
    <div class="mt-3">
      <h6>Authors</h6>
      <div>{{authorList || 'None'}}</div>
    </div>
    <div class="mt-3">
      <h6>Publication Year</h6>
      <div>{{data.raw.bibjson.year || 'None'}}</div>
    </div>
    <div class="mt-3">
      <h6>Publisher</h6>
      <div>{{data.raw.bibjson.publisher || 'None'}}</div>
    </div>
    <div class="mt-3 preview-container hide-scrollbar">
      <div>
        <h6>{{artifactHeader}}</h6>
        <div v-for="(artifact) in artifactList" :key="artifact.id"
          class="shadow artifact-img"
          :style="imageStyle(artifact.bytes)"
          :title="artifact.header_content"
        />
      </div>
    </div>
    <div class="my-3">
      <a @click="showMoreHandler" href="/">Show more...</a>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';

  import { CosmosArtifactInterface, CosmosArtifactObjectInterface } from '@/types/typesCosmos';

  import { getAuthorList } from '@/utils/CosmosDataUtil';
  import { cosmosArtifactsMem } from '@/services/CosmosFetchService';

  const ARTIFACT_DISPLAY_LIMIT = 4;

  @Component({ })
  export default class KnowledgePreviewPane extends Vue {
    @Prop({ required: false }) private data: any;

    @Watch('data') onDataChange (): any {
      this.getArtifactList();
    }

    artifactTotal: number = 0;
    artifactList: CosmosArtifactObjectInterface[] = [];

    created (): void {
      this.getArtifactList();
    }

    get artifactHeader (): string {
      const { artifactList, artifactTotal } = this;
      return 'Artifacts' + (artifactList && artifactList.length ? ` ${artifactList.length}/${artifactTotal}` : '');
    }

    async getArtifactList (): Promise<void> {
      const response: CosmosArtifactInterface = await cosmosArtifactsMem({ doi: this.data.raw.bibjson.identifier[0].id });
      this.artifactTotal = response.objects.length;
      let numArtifactDisplayed = 0;
      this.artifactList = response.objects.filter(artifact =>
        artifact.bytes && (numArtifactDisplayed < ARTIFACT_DISPLAY_LIMIT) && ++numArtifactDisplayed) ?? [];
    }

    imageStyle (imgBytes: string): any {
      let backgroundImage = 'none';
      if (imgBytes) {
        let isBase64 = true;
        try {
          window.atob(imgBytes);
        } catch (e) {
          if (e.code === 5) {
            isBase64 = false;
          }
        }
        backgroundImage = isBase64 ? `url(data:image/gif;base64,${imgBytes})` : `url(${imgBytes})`;
      }

      return { backgroundImage };
    }

    get doi (): string {
      return this.data.raw.bibjson.identifier[0].id;
    }

    get authorList (): string {
      return getAuthorList(this.data.raw);
    }

    showMoreHandler (e: Event): void {
        this.$emit('open-modal');
        e.preventDefault();
    }
  }
</script>

<style scoped>
.knowledge-preview-pane-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  width: 100%;
}

.preview-container {
  overflow: hidden scroll;
}

.artifact-img {
  background-color: #EAEBEC;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border: 1px solid var(--icon-color);
  border-radius: 10px;
  float: left;
  height: 0;
  margin: 2.5%;
  padding-top: 45%;
  width: 45%;
}
</style>
