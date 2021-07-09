<template>
  <modal @close="onClickClose">
    <div slot="header">
      <a :href="url" target="_blank"><h3>{{ title }}</h3></a>
      <h5 class="m-0">{{ doi }}</h5>
    </div>
    <div slot="body" class="d-flex flex-column flex-grow-1">
      <div class="d-flex flex-grow-1">
        <div class="d-flex col-7">
          <div class="image flex-grow-1" :style="imageStyle"/>
        </div>
        <div class="d-flex flex-column col">
          <div class="font-weight-bolder">Authors</div>
          <div>{{ authorList }}</div>
          <div class="font-weight-bolder mt-3">Publication Year</div>
          <div>{{ publicationYear }}</div>
          <div class="font-weight-bolder mt-3">Publisher</div>
          <div>{{ publisher }}</div>
          <div class="font-weight-bolder mt-3">Excerpt</div>
          <div class="position-relative flex-grow-1">
            <div class="position-absolute h-100 w-100 pr-1 overflow-auto">
              {{ excerpt }}
            </div>
          </div>
        </div>
      </div>
      <similar-docs :doi="doi" class="m-3"/>
    </div>
    <button
      v-if="linkToKnowledgeSpace"
      slot="footer"
      type="button"
      class="btn btn-link"
      @click="openKnowledgeView()"
    >
      Explore all in the Knowledge space
      <font-awesome-icon class="icon" :icon="['fas', 'search']"/>
    </button>
  </modal>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import { getAuthorList } from '@/utils/CosmosDataUtil';
  import CloseButton from '@/components/widgets/CloseButton.vue';

  import SimilarDocs from '@/components/SimilarDocs.vue';
  import Modal from '@/components/Modal.vue';
  import { CardInterface } from '@/types/types';
  import {
    CosmosArtifactInterface,
    CosmosArtifactObjectInterface,
    CosmosSearchBibjsonInterface,
    CosmosSearchChildrenInterface,
  } from '@/types/typesCosmos';

  const components = {
    CloseButton,
    SimilarDocs,
    Modal,
  };

  @Component({ components })
  export default class ModalDocument extends Vue {
    @Prop({ required: false }) private data: CardInterface;
    @Prop({ required: false }) private artifact: CosmosArtifactInterface;
    @Prop({ default: false }) linkToKnowledgeSpace: boolean;

    get authorList (): string {
      return getAuthorList(this.artifact ?? this.data?.raw);
    }

    get bibjson (): CosmosSearchBibjsonInterface {
      return this.artifact?.bibjson ?? this.data?.raw?.bibjson;
    }

    get children (): CosmosSearchChildrenInterface[] | CosmosArtifactObjectInterface[] {
      return this.artifact?.objects ?? this.data?.raw.children ?? [];
    }

    get doi (): string {
      return this.bibjson?.identifier[0]?.id;
    }

    get publisher (): string {
      return this.bibjson?.publisher || 'None';
    }

    get url (): string {
      return this.bibjson?.link?.[0]?.url;
    }

    get title (): string {
      return this.bibjson?.title ?? this.data?.title ?? '';
    }

    get excerpt (): string {
      return this.children[0]?.content ?? '';
    }

    get publicationYear (): string {
      return this.bibjson?.year || 'None';
    }

    get imagePreview (): string {
      return this.children?.[0]?.bytes ?? this.data?.previewImageSrc;
    }

    get imageStyle (): any {
      let backgroundImage = 'none';
      const imgBytes = this.imagePreview;
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

    onClickClose (): void {
      this.$emit('close');
    }

    onClickStop (e: MouseEvent): void {
      e.stopPropagation();
    }

    openKnowledgeView () : void {
      this.$router.push({ name: 'docsCards' });
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.container {
  height: 90vh;
  background: white;
}

.image {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
