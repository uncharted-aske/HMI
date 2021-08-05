<template>
  <div
    class="provenance-close-button"
    @click="onClick"
  >
    <font-awesome-icon :icon="['fas', 'times']" />
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';

  @Component
  export default class ProvenanceCloseButton extends Vue {
    onClick (): void {
      this.$emit('close');
    }
  }

</script>

<style scoped>
.provenance-close-button {
  align-items: center;
  border-radius: 3px;
  color: var(--icon-color);
  cursor: pointer;
  display: flex;
  font-size: 16px;
  height: 26px;
  justify-content: center;
  position: absolute;
  right: 12px;
  top: 66px;
  width: 26px;
  z-index: 10;
}

.provenance-close-button:hover {
  background-color: var(--nord2);
}
</style>
