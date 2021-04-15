<template>
  <div v-if="loading" class="loader-container">
    <div class="loader" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';

  @Component
  export default class Loader extends Vue {
     @Prop({ default: false }) loading: boolean;
  }
</script>
