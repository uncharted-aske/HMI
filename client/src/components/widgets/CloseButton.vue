<template>
  <div
    class="close-button"
    @click="$emit('click')"
  >
    <font-awesome-icon :icon="['fas', 'times']" />
  </div>
</template>

<script>
  export default {
    name: 'CloseButton',
  };
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
    color: red;
  }

  position: absolute;
  top: 12px;
  right: 12px;
}
</style>
