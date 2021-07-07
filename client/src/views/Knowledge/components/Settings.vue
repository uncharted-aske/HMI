<template>
  <div class="settings-container">
    <button
      type="button" class="btn btn-secondary mr-1"
      disabled
    >
      Entity-based Views
    </button>
    <button
      type="button" class="btn btn-secondary mr-1"
      disabled
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

  const components = {

  };
  @Component({ components })
  export default class Settings extends Vue {

  }
</script>

<style scoped>
.settings-container {
  align-items: center;
  display: flex;
  height: 100%;
  padding: 2px 5px;
  position: relative;
}
.settings-container .btn {
  align-items: center;
  display: flex;
  height: 100%;
}

.settings-container .btn .view-name {
  font-weight: bold;
  margin: 5px;
}

.dropdown-settings {
  align-items: center;
  display: flex;
  height: var(--secondary-bar-width);
  padding: 10px;
  position: absolute;
  top: calc(var(--secondary-bar-width) - 15px);
}

</style>
