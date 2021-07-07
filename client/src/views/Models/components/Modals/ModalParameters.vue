<template>
  <modal
    @close="close()"
  >
    <div slot="header">
      <h4>
        <a :href="data.objects[0].bibjson.link[0].url" target="_blank">
          <h3>{{data.objects[0].bibjson.title}}</h3>
        </a>
      </h4>
      <h5>{{data.objects[0].bibjson.identifier[0].id}}</h5>
    </div>
    <div slot="body" class="d-flex flex-grow-1">
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
          {{data.objects[0].bibjson.year || 'None'}}
        </div>
        <div class="font-weight-bolder mt-3">Publisher</div>
        <div>
          {{data.objects[0].publisher || 'None'}}
        </div>
        <!-- <div class="font-weight-bolder mt-3">Excerpt</div>
        <div class="position-relative flex-grow-1">
          <div class="position-absolute h-100 w-100 pr-1 overflow-auto">
            {{excerpt}}
          </div>
        </div> -->
      </div>
    </div>
    <similar-docs slot="body" :doi="doi" class="my-4"/>
    <div slot="footer" class="related-docs">
      <button
        type="button"
        class="btn btn-link"
        @click="openKnowledgeView()"
      >
        Explore All
        <font-awesome-icon class="icon" :icon="['fas', 'search']"/>
      </button>
    </div>
  </modal>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import Modal from '@/components/Modal.vue';
  import SimilarDocs from '@/components/SimilarDocs.vue';
  import { getAuthorList } from '@/utils/CosmosDataUtil';

  const components = {
    Modal,
    SimilarDocs,
  };
@Component({ components })
  export default class ModalKnowledgeParameters extends Vue {
    @Prop({ default: null }) data: any;
    get authorList (): string {
      return getAuthorList(this.data.objects[0].bibjson.author);
    }

    get doi (): string {
      return this.data.objects[0].bibjson.identifier[0].id;
    }

    get imageStyle (): {backgroundImage: string} {
      let backgroundImage = 'none';
      const image = this.data.objects[0].children[0].bytes; // Find the first image
      if (image) {
          let isBase64 = true;
          try {
            window.atob(image);
          } catch (e) {
            if (e.code === 5) {
              isBase64 = false;
            }
          }
          backgroundImage = isBase64
            ? `url(data:image/gif;base64,${image})`
            : `url(${image.bytes})`;
    }
      return { backgroundImage };
    }

    close (): void {
      this.$emit('close', null);
    }

    openKnowledgeView () : void {
      this.$router.push({ name: 'knowledgeDocsClusters' });
    }
  }
</script>

<style scoped>
.image {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.related-docs {
  display: flex;
  justify-content: space-between;
}
</style>
