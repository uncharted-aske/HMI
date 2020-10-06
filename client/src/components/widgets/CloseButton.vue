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

<style lang="scss" scoped>

.close-button {
  font-size: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: rgba(38, 50, 56, 0.1);
  }

  position: absolute;
  top: 12px;
  right: 12px;
}
</style>
