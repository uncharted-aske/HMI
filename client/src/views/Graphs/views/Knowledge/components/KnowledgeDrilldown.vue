<template>
  <modal v-if="data.raw" @close="onClickClose">
    <div slot="header">
      <a :href="data.raw.bibjson.link[0].url" target="_blank">
        <h3>{{data.title}}</h3>
      </a>
      <h5 class="m-0">{{data.raw.bibjson.identifier[0].id}}</h5>
    </div>
    <div slot="body" class="d-flex flex-column flex-grow-1">
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
      <similar-docs :doi="doi" class="d-flex flex-column m-3"/>
    </div>
  </modal>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import _ from 'lodash';

  import { getAuthorList } from '@/utils/CosmosDataUtil';
  import CloseButton from '@/components/widgets/CloseButton.vue';

  import SimilarDocs from '@/components/widgets/SimilarDocs.vue';
  import Modal from '@/components/Modal.vue';
  import { CardInterface } from '@/components/Cards/types';

  const components = {
    CloseButton,
    SimilarDocs,
    Modal,
  };

  @Component({ components })
  export default class KnowledgeDrilldown extends Vue {
    @Prop({ required: false }) private data: CardInterface;

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
</style>
