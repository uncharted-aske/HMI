<template>
  <div class="settings-container">
    <button
      type="button" class="btn btn-secondary mr-1"
      :disabled="this.$route.name === 'knowledgeDocsClusters'"
      @click="$router.push({ name: 'knowledgeDocsClusters' })"
    >
      Entity-based Views
    </button>
    <button
      type="button" class="btn btn-secondary mr-1"
      :disabled="this.$route.name === 'knowledge'"
      @click="$router.push({ name: 'knowledge' })"
    >
      Document-based Views
    </button>
    <button type="button" class="btn btn-secondary mr-1" disabled>Layouts</button>
    <button type="button" class="btn btn-secondary mr-1" disabled>Settings</button>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  //   import { Prop } from 'vue-property-decorator';

  const components = {

  };
  @Component({ components })
  export default class Settings extends Vue {

  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.settings-container {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 2px 5px;
  .btn {
    display: flex;
    align-items: center;
    height: 100%;
    .view-name {
      font-weight: bold;
      margin: 5px;
    }
  }
}

.dropdown-settings {
  display: flex;
  align-items: center;
  position: absolute;
  top: calc(#{$secondary-bar-width} - 15px);
  height: calc(#{$secondary-bar-width});
  padding: 10px;
}

</style>
