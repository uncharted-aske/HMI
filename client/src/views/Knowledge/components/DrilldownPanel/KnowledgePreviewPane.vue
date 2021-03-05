<template>
  <div>
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
    <div class="mt-3 flex-grow-1 position-relative overflow-hidden">
      <div class="position-absolute h-100 w-100">
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
  export default class KnowledgePanelPreview extends Vue {
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
        this.$emit('open-drilldown');
        e.preventDefault();
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

  .artifact-img {
    width: 45%;
    height: 0;
    padding-top: 45%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    background-color: #EAEBEC;
    float: left;
    border: $icon-color solid 1px;
    border-radius: 10px;
    margin: 2.5%;
  }

</style>
