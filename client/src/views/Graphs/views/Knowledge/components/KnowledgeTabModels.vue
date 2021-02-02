<template>
  <div>
    <div class="border-bottom">
      <a :href="card.raw.bibjson.link[0].url" target="_blank">
        <h5>{{card.title}}</h5>
      </a>
      <h6>{{doi}}</h6>
    </div>
    <div class="mt-3">
      <div class="px-2 py-4 d-flex justify-content-center border rounded-lg" role="button" @click="$router.push({ name: 'bioView' })">
        <div>COVID-19 Model</div>
      </div>
      <div class="my-4 d-flex justify-content-center font-weight-bold">⋮</div>
      <button type="button" class="btn btn-primary w-100 px-2 py-4" @click="$router.push({ name: 'home' })">Go to Models</button>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  @Component({ })
  export default class KnowledgeTabPreview extends Vue {
    @Prop({ required: false }) private card: any;

    get doi (): string {
      return this.card.raw.bibjson.identifier[0].id;
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

</style>
