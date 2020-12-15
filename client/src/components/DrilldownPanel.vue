<template>
  <div class="drilldown-panel-container" v-if="isOpen">
      <div class="panel-header">
        <h5>{{paneTitle}}</h5>
        <h6>{{paneSubtitle}}</h6>
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
  export default class DrilldownPanel extends Vue {
    @Prop({ default: false })
    isOpen: boolean;

    @Prop({ default: '' })
    paneTitle: string;

    @Prop({ default: '' })
    paneSubtitle: string;

    onClose (): void {
      this.$emit('close-pane');
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.drilldown-panel-container {
  width: 25vw;
  height: $content-full-height;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  position: absolute;
  right:0;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  box-sizing: border-box;
  padding: 5px;
  z-index: map-get($z-index-order, side-panel);

  .panel-header {
    text-align: left;
    border-bottom: 1px solid $border;
    padding: 5px;
  }
  .panel-body {
    margin-top: 5px;
  }
}

</style>
