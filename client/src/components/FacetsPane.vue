<template>
  <div class="facets-pane-container">
    <close-button @close="$emit('close')"/>
    FACETS
  </div>
</template>

<script>

  import CloseButton from '@/components/widgets/CloseButton.vue';

  export default {
    name: 'FacetsPane',
    components: {
      CloseButton,
    },
  };
</script>

<style lang="scss" scoped>
</style>
