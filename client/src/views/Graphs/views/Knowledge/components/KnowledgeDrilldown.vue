<template>
  <div class="knowledge-drilldown position-fixed d-flex align-items-center w-100 h-100"
    v-if="show"
    @click="onClickClose"
  >
    <div class="position-relative d-flex flex-column py-3 pr-0 rounded shadow container" @click="onClickStop">
      <close-button @close="onClickClose"/>
      <a :href="data.raw.bibjson.link[0].url" target="_blank">
        <h3>{{data.title}}</h3>
      </a>
      <h5>{{data.raw.bibjson.identifier[0].id}}</h5>
      <div class="d-flex flex-grow-1">
          <div class="d-flex col-7">
            <div class="image flex-grow-1" :style="imageStyle(this.data.previewImageSrc)"/>
          </div>
          <div class="d-flex flex-column col">
            <div class="font-weight-bolder">Authors</div>
            <div>
              {{authorList}}
            </div>
            <div class="font-weight-bolder mt-3">Publication Year</div>
            <div>
              {{data.raw.bibjson.year || 'None'}}
            </div>
            <div class="font-weight-bolder mt-3">Publisher</div>
            <div>
              {{data.raw.bibjson.publisher || 'None'}}
            </div>
            <div class="font-weight-bolder mt-3">Excerpt</div>
            <div class="position-relative flex-grow-1">
              <div class="position-absolute h-100 w-100 pr-1 overflow-auto">
                {{excerpt}}
              </div>
            </div>
          </div>
      </div>
      <div class="d-flex flex-column mt-3">
        <div class="row mr-0">
          <div class="col" v-for="(similarDoc) in similarDocList" :key="similarDoc.bibjson._gddid">
            <h6>{{similarDoc.bibjson.title}}</h6>
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
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';
  import _ from 'lodash';

  import { cosmosSimilar } from '@/utils/CosmosFetchUtil';
  import { getAuthorList } from '@/utils/CosmosDataUtil';
  import CloseButton from '@/components/widgets/CloseButton.vue';

  import { CosmosSimilarDataInterface } from '@/types/typesCosmos';
  import { CardInterface } from '@/components/Cards/types';

  const components = {
    CloseButton,
  };

  const SIMILAR_DOC_LIMIT = 4;
  const ARTIFACT_LIMIT = 2;

  @Component({ components })
  export default class KnowledgeDrilldown extends Vue {
    @Prop({ required: false }) private data: CardInterface;

    similarDocList: CosmosSimilarDataInterface[] = [];

    @Watch('data') onDataChanged (newData: CardInterface): void {
      this.getSimilar(newData);
    }

    async getSimilar (newData: CardInterface): Promise<void> {
      if (!_.isEmpty(newData)) {
        const response = await cosmosSimilar(newData.raw.bibjson.identifier[0].id);
        response.data.map(similarDoc => {
          similarDoc.objects = similarDoc.objects.filter(object => object.bytes !== null).slice(0, ARTIFACT_LIMIT);
          return similarDoc;
        });
        this.similarDocList = response.data.filter(similarDoc => similarDoc.objects.length > 0).slice(0, SIMILAR_DOC_LIMIT);
      }
    }

    get doi (): string {
      return this.data.raw.bibjson.identifier[0].id;
    }

    onClickClose (): void {
      this.$emit('close-drilldown');
    }

    onClickStop (e: MouseEvent): void {
      e.stopPropagation();
    }

    get authorList (): string {
      return getAuthorList(this.data.raw);
    }

    get excerpt (): string {
      return this.data.raw.children[0]
        ? this.data.raw.children[0].content
        : '';
    }

    get show (): boolean {
      return !_.isEmpty(this.data);
    }

    get hasImage (): boolean {
      return this.data.previewImageSrc !== '';
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

.knowledge-drilldown {
  top: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1200;
}

.container {
  height: 90vh;
  background: white;
}

.image {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

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
