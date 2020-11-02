<template>
  <div class="left-side-panel-container">
      <div class="panel-header">
        <h5>{{paneTitle}}</h5>
      </div>
      <close-button @close="onClose"/>
      <div class="panel-body">
         <slot name="content" />
      </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import CloseButton from '@/components/widgets/CloseButton.vue';

  const components = {
    CloseButton,
  };

  @Component({ components })
  export default class LeftSidePanel extends Vue {
    @Prop({ default: false })
    isOpen: boolean;

    @Prop({ default: '' })
    paneTitle: string;

    onClose (): void {
      this.$emit('close-pane');
    }
  }
</script>

<style lang="scss" scoped>
@import "../styles/variables";

.left-side-panel-container {
  position: relative;
  width: 20%;
  height: 100%;
  background-color: $secondary-bar-bg;
  border: 1px solid $border;
  z-index: map-get($z-index-order, left-side-panel);
}

</style>
