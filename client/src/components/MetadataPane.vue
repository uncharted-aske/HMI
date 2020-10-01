<template>
  <div class="metadata-pane-container">
    <close-button @close="$emit('close')"/>
    METADATA
  </div>
</template>

<script>

  import CloseButton from '@/components/widgets/CloseButton.vue';

  export default {
    name: 'MetadataPane',
    components: {
      CloseButton,
    },
  };
</script>

<style lang="scss" scoped>
</style>
