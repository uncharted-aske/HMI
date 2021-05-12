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
        <li v-for="(similarDoc, index) in similarDocList" :key="index">
          <a class="document" :href="similarDoc.bibjson.link[0].url" target="_blank">
            <h6 class="title">{{ similarDoc.bibjson.title }}</h6>
            <div v-for="(artifact) in similarDoc.objects" :key="artifact.id"
              class="artifact shadow"
              :style="imageStyle(artifact.bytes)"
              :title="artifact.header_content"
            />
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
      this.isLoading = false;
    }

    @Watch('doi') onDoiChanged (doi: string): void {
      this.isLoading = true;
      this.getSimilar(doi);
    }

    // Check that we have similar document to display.
    get hasDocuments (): boolean {
      return this.similarDocList?.length > 0;
    }

    get title (): string {
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
        this.similarDocList = response.data.filter(similarDoc => similarDoc.objects.length > 0);
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
  --list-height: 15em;
  --list-gap: 1.25em;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; // 3 documents per row
  height: var(--list-height); // Display one row at the time
  list-style: none;
  margin: 0;
  overflow-y: auto; // Scrollbar for more that 3 documents lists
  padding: 0;
}

.list-documents li {
  padding: var(--list-gap);
}

.document {
  --document-height: calc(var(--list-height) - var(--list-gap) * 2);
  --artifact-height: calc(var(--list-height) / 2);
  --title-height: calc(var(--document-height) - var(--artifact-height));
  display: grid;
  height: var(--document-height);
  grid-template-areas: "title title"". .";
  grid-template-rows: var(--title-height) var(--artifact-height);
}

.title {
  grid-area: title;
  margin: 0;
}

.artifact {
  background-color: $nord4;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border: $icon-color solid 1px;
  border-radius: 10px;
  height: var(--artifact-height);
  justify-self: center;
  width: var(--artifact-height);
}
</style>
