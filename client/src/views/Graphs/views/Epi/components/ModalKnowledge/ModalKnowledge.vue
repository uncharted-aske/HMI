<template>
  <modal
    @close="close()"
  >
    <div slot="header">
      <h4>
        <a :href="data.bibjson.link[0].url" target="_blank">
          <h3>{{data.bibjson.title}}</h3>
        </a>
      </h4>
      <h5>{{data.bibjson.identifier[0].id}}</h5>
    </div>
    <div
      slot="body"
    >
      <div class="d-flex flex-grow-1">
          <div class="d-flex col-7">
            <div class="image flex-grow-1" :style="imageStyle"/>
          </div>
          <div class="d-flex flex-column col">
            <div class="font-weight-bolder">Authors</div>
            <div>
              {{authorList}}
            </div>
            <div class="font-weight-bolder mt-3">Publication Year</div>
            <div>
              {{data.bibjson.year || 'None'}}
            </div>
            <div class="font-weight-bolder mt-3">Publisher</div>
            <div>
              {{data.bibjson.publisher || 'None'}}
            </div>
            <div class="font-weight-bolder mt-3">Excerpt</div>
            <div class="position-relative flex-grow-1">
              <!-- <div class="position-absolute h-100 w-100 pr-1 overflow-auto">
                {{excerpt}}
              </div> -->
            </div>
          </div>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
  import _ from 'lodash';

  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import Modal from '@/components/Modal.vue';

  import { getAuthorList } from '@/utils/CosmosDataUtil';


  const components = {
    Modal,
  };

@Component({ components })
  export default class ModalKnowledge extends Vue {
    @Prop({ default: null }) data: any;

    get authorList (): string {
      return getAuthorList(this.data.bibjson.author);
    }

    get imageStyle (): {backgroundImage: string} {
      let backgroundImage = 'none';
      const image = this.data.objects.find(object => object.cls === 'Figure'); // Find the first image
      if (image) {
          let isBase64 = true;
          try {
            window.atob(image.bytes);
          } catch (e) {
            if (e.code === 5) {
              isBase64 = false;
            }
          }
          backgroundImage = isBase64
            ? `url(data:image/gif;base64,${image.bytes})`
            : `url(${image.bytes})`;
    }
      return { backgroundImage };
    }

    close (): void {
      this.$emit('close', null);
    }
  }
</script>

<style lang="scss" scoped>

img {
  // Clip images that are too big, but maintain aspect ratio
  object-fit: cover;
  width: 100%;
  height: 100%
}

</style>
