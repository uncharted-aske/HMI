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
  // position: relative;
  width: 25%;
  height: 100%;
  background-color: $body-bg;
  border: 1px solid $border;
}

</style>
