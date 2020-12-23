<template>
  <div class="knowledge-drilldown position-fixed d-flex align-items-center w-100 h-100"
    v-if="show"
    @click="onClickClose"
  >
    <div class="d-flex flex-column py-3 pr-0 rounded shadow container" @click="onClickStop">
      <h3>{{card.title}}</h3>
      <h5>{{card.raw.bibjson.identifier[0].id}}</h5>
      <div class="d-flex flex-grow-1">
          <div class="d-flex col-7">
            <div class="image flex-grow-1" :style="imageStyle"/>
          </div>
          <div class="d-flex flex-column col">
            <div class="font-weight-bolder">Authors</div>
            <div class="authors">
              {{authorList}}
            </div>
            <div class="font-weight-bolder pt-2">Excerpt</div>
            <div class="position-relative flex-grow-1">
              <div class="position-absolute h-100 w-100 pr-1 overflow-auto">
                {{excerpt}}
              </div>
            </div>
          </div>
      </div>
      <div class="row">

      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import _ from 'lodash';

  import { getAuthorList } from '@/utils/WiscDataUtil';

  const components = {

  };
  @Component({ components })
  export default class KnowledgeDrilldown extends Vue {
    @Prop({ required: false }) private card: any;

    onClickClose (): void {
      this.$emit('close-card');
    }

    onClickStop (e: MouseEvent): void {
      e.stopPropagation();
    }

    get authorList (): string {
      return getAuthorList(this.card.raw);
    }

    get excerpt (): string {
      return this.card.raw.children[0]
        ? this.card.raw.children[0].content
        : '';
    }

    get show (): boolean {
      return !_.isEmpty(this.card);
    }

    get hasImage (): boolean {
      return this.card.previewImageSrc !== '';
    }

    get imageStyle (): {backgroundImage: string} {
      let backgroundImage = 'none';
      if (this.hasImage) {
        let isBase64 = true;
        try {
          window.atob(this.card.previewImageSrc);
        } catch (e) {
          if (e.code === 5) {
            isBase64 = false;
          }
        }
        backgroundImage = isBase64
          ? `url(data:image/gif;base64,${this.card.previewImageSrc})`
          : `url(${this.card.previewImageSrc})`;
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
