<template>
  <div v-if="loading" class="loader-container">
    <div class="loader">{{ message }}</div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';


  @Component
  export default class Loader extends Vue {
     @Prop({ default: false }) loading: boolean;
     @Prop({ default: 'Loading...' }) message: string;

  }

</script>

<style lang="scss" scoped>
</style>
