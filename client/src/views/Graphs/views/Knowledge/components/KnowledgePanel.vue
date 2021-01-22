<template>
<div>
  <ul class="nav nav-tabs">
    <li class="nav-item">
      <a class="nav-link active">Preview</a>
    </li>
    <li class="nav-item">
      <a class="nav-link disabled">Models</a>
    </li>
    <li class="nav-item">
      <a class="nav-link disabled">Entities</a>
    </li>
  </ul>
  <div class="mt-3 mx-1 d-flex flex-column" v-if="displaySummary">
    <div class="border-bottom">
      <a :href="card.raw.bibjson.link[0].url" target="_blank">
        <h5>{{card.title}}</h5>
      </a>
      <h6>{{card.raw.bibjson.identifier[0].id}}</h6>
    </div>
    <div class="mt-3">
      <h6>Authors</h6>
      <div>{{authorList || 'None'}}</div>
    </div>
    <div class="mt-3">
      <h6>Publication Year</h6>
      <div>{{card.raw.bibjson.year || 'None'}}</div>
    </div>
    <div class="mt-3">
      <h6>Publisher</h6>
      <div>{{card.raw.bibjson.publisher || 'None'}}</div>
    </div>
    <div class="mt-5">
      <a @click="showMoreHandler" href="/">Show more...</a>
    </div>
  </div>
</div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  import { getAuthorList } from '@/utils/CosmosDataUtil';

  @Component({ })
  export default class KnowledgePanel extends Vue {
    @Prop({ required: false }) private card: any;

    activeTab = 0;

    get displaySummary (): boolean {
      return true;
    }

    get authorList (): string {
      return getAuthorList(this.card.raw);
    }

    showMoreHandler (e: Event): void {
        this.$emit('close-card');
        e.preventDefault();
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

</style>
