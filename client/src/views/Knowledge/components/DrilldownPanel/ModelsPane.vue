<template>
  <div>
    <div class="border-bottom">
      <a :href="data.raw.bibjson.link[0].url" target="_blank">
        <h5>{{data.title}}</h5>
      </a>
      <h6>{{doi}}</h6>
    </div>
    <div class="mt-3">
      <div class="px-2 py-4 d-flex justify-content-center border rounded-lg" role="button" @click="$router.push({ name: 'bio' })">
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
  export default class ModelsPane extends Vue {
    @Prop({ required: false }) private data: any;

    get doi (): string {
      return this.data.raw.bibjson.identifier?.[0]?.id;
    }
  }
</script>
