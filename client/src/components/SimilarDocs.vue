<template>
  <aside class="similar-documents" :class="{ loading: isLoading }">
    <!-- Loading -->
    <loader v-if="isLoading" :loading="isLoading" />

    <!-- Empty message -->
    <p v-else-if="!hasDocuments" class="no-documents">
      No related documents available.
    </p>

    <!-- List of similar documents -->
    <template v-else>
      <h3>{{ title }}</h3>
      <ul class="list-documents">
        <li
          v-for="(similarDoc, index) in similarDocList" :key="index"
          class="document"
        >
          <a :href="similarDoc.bibjson.link[0].url" target="_blank">
            <h6>{{similarDoc.bibjson.title}}</h6>
            <div class="d-flex justify-content-between">
              <div v-for="(artifact) in similarDoc.objects" :key="artifact.id"
                class="similar-img shadow"
                :style="imageStyle(artifact.bytes)"
                :title="artifact.header_content"
              />
            </div>
          </a>
        </li>
      </ul>
    </template>
  </aside>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';

  import { cosmosSimilar } from '@/services/CosmosFetchService';
  import CloseButton from '@/components/widgets/CloseButton.vue';
  import Loader from '../components/widgets/Loader.vue';

  import { CosmosSimilarDataInterface } from '@/types/typesCosmos';

  const components = {
    CloseButton,
    Loader,
  };

  const SIMILAR_DOC_LIMIT = 4;
  const ARTIFACT_LIMIT = 2;

  @Component({ components })
  export default class SimilarDocs extends Vue {
    @Prop({ required: false }) private doi: string;

    isLoading: boolean = true;
    similarDocList: CosmosSimilarDataInterface[] = [];

    created (): void {
      if (this.doi) {
        this.getSimilar(this.doi);
      }
    }

    @Watch('doi') onDoiChanged (doi: string): void {
      this.getSimilar(doi);
    }

    // Check that we have similar document to display.
    get hasDocuments(): boolean {
      return this.similarDocList?.length > 0;
    }

    get title(): string {
      const nbDocuments = this.similarDocList?.length ?? 0;
      if (nbDocuments > 1) {
        return nbDocuments + ' Related documents';
      }
      return 'Related document';
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
      this.isLoading = false;
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

// Needed for the Loader component.
.similar-documents.loading {
  min-height: 6rem;
  position: relative;
}

.no-documents {
  font-style: italic;
  margin-bottom: 0;
}

.list-documents {
  display: grid;
  gap: 2em;
  grid-template-columns: 1fr 1fr 1fr; // 3 documents per row
  height: 12em; // Display one row at the time
  list-style: none;
  margin: 0;
  overflow-y: auto; // Scrollbar for more that 3 documents lists
  padding: 0;
}

.document a {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
