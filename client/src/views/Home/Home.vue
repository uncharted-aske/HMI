<template>
  <div class="view-container">
    <h1>Homepage</h1>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';

  // -- DO NOT REMOVE
  // https://github.com/uncharted-aske/HMI/issues/208
  import { initializeLex } from '@/utils/LexUtil';
  initializeLex({ pills: [], onChange: () => null });
  // -- DO NOT REMOVE

  @Component
  export default class Home extends Vue {}
</script>
