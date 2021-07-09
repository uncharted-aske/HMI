<template>
  <modal @close="close()">
    <div slot="header">
      <a :href="data.bibjson.link[0].url" target="_blank">
        <h3>{{ data.bibjson.title }}</h3>
      </a>
      <h5>{{ data.bibjson.identifier[0].id }}</h5>
    </div>
    <div slot="body" >
      <div class="d-flex flex-grow-1">
          <div class="d-flex flex-column col">
            <div class="font-weight-bolder">Authors</div>
            <div>{{ authorList }}</div>
            <div class="font-weight-bolder mt-3">Publication Year</div>
            <div>{{ data.bibjson.year || 'None' }}</div>
            <div class="font-weight-bolder mt-3">Publisher</div>
            <div>{{ data.publisher || 'None' }}</div>
          </div>
      </div>
    </div>
      <div slot="footer" class="related-docs">
        <button
          type="button"
          class="btn btn-link"
          @click="openKnowledgeView()"
        >
          Explore all in the Knowledge space
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

  const components = {
    Modal,
  };

  @Component({ components })
  export default class ModalDocMetadata extends Vue {
    @Prop({ default: null }) data: any;
    get authorList (): string {
      return this.data.bibjson.author.map(a => a.name).join();
    }

    close (): void {
      this.$emit('close', null);
    }

    openKnowledgeView () : void {
      this.$router.push({ name: 'docsCards' });
    }
  }
</script>

<style scoped>
  .image {
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
  }

  .related-docs {
    display: flex;
    justify-content: space-between;
  }
</style>
