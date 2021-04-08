<template>
  <div>
    <h3 v-if="similarDocList.length > 0">Related documents</h3>
    <div class="row mr-0">
      <div class="col" v-for="(similarDoc) in similarDocList" :key="similarDoc.bibjson._gddid">
        <a :href="similarDoc.bibjson.link[0].url" target="_blank">
          <h6>{{similarDoc.bibjson.title}}</h6>
        </a>
      </div>
    </div>
    <div class="row mr-0">
      <div class="d-flex col justify-content-between" v-for="(similarDoc) in similarDocList" :key="similarDoc.bibjson._gddid">
        <div v-for="(artifact) in similarDoc.objects" :key="artifact.id"
          class="similar-img shadow"
          :style="imageStyle(artifact.bytes)"
          :title="artifact.header_content"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';

  import { cosmosSimilar } from '@/services/CosmosFetchService';
  import CloseButton from '@/components/widgets/CloseButton.vue';

  import { CosmosSimilarDataInterface } from '@/types/typesCosmos';

  const components = {
    CloseButton,
  };

  const SIMILAR_DOC_LIMIT = 4;
  const ARTIFACT_LIMIT = 2;

  @Component({ components })
  export default class SimilarDocs extends Vue {
    @Prop({ required: false }) private doi: string;

    similarDocList: CosmosSimilarDataInterface[] = [];

    created (): void {
      if (this.doi) {
        this.getSimilar(this.doi);
      }
    }

    @Watch('doi') onDoiChanged (doi: string): void {
      this.getSimilar(doi);
    }

    async getSimilar (doi: string): Promise<void> {
      if (doi) {
        const response = await cosmosSimilar({ doi, image_type: 'thumbnail' });
        response.data.map(similarDoc => {
          similarDoc.objects = similarDoc.objects.filter(object => object.bytes !== null).slice(0, ARTIFACT_LIMIT);
          return similarDoc;
        });
        this.similarDocList = response.data.filter(similarDoc => similarDoc.objects.length > 0).slice(0, SIMILAR_DOC_LIMIT);
      }
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
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.similar-img {
  width: 45%;
  height: 0;
  padding-top: 45%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-color: #EAEBEC;
  border: $icon-color solid 1px;
  border-radius: 10px;
}
</style>
