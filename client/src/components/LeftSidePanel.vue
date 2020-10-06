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
  height: $content-full-height;
  width: 20vw;
  background-color: $body-bg;
  position: relative;
  left: 100%;
  top: 0;
  z-index: map-get($z-index-order, side-panel);
  box-shadow: 0 -1px 0 $border, 0 0 2px rgba(0,0,0,.12), 2px 2px 4px rgba(0,0,0,.24);
}

</style>
