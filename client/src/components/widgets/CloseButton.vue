<template>
  <div
    class="close-button"
    @click="onClick"
  >
    <font-awesome-icon :icon="['fas', 'times']" />
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';

  @Component
  export default class CloseButton extends Vue {
    onClick (): void {
      this.$emit('close');
    }
  }

</script>

<style scoped>
.close-button {
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
  top: 12px;
  width: 26px;
  z-index: 10;
}

.close-button:hover {
  background-color: rgba(38, 50, 56, 0.1);
}
</style>
