<template>
  <div class="container">
    <button
      type="button"
      class="btn btn-primary"
      @click="openView('epiView')"
    > EPI view </button>

    <button
      type="button"
      class="btn btn-primary"
      @click="openView('bioView')"
    > BIO view </button>

    <JSComponent/>
    <TSComponent/>
    <TSClassComponent/>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';

  import JSComponent from '@/components/JSComponent.vue';
  import TSComponent from '@/components/TSComponent.vue';
  import TSClassComponent from '@/components/TSClassComponent.vue';

  const components = {
    JSComponent,
    TSComponent,
    TSClassComponent,
  };

  @Component({ components })
  export default class Home extends Vue {
    public openView (view: string): void {
      this.$router.push({ name: view });
    }
  }
</script>

<style lang="scss" scoped>
.btn {
  margin: 5px;
}
</style>
