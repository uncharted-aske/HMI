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
  import { Prop, Watch } from 'vue-property-decorator';

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
@import "../styles/variables";

.drilldown-panel-container {
  position: relative;
  width: 20%;
  height: 100%;
  background-color: $secondary-bar-bg;
  border: 1px solid $border;
  padding: 10px;
  .panel-header {
    text-align: left;
    border-bottom: 1px solid $border;
  }
  .panel-body {
    margin-top: 5px;

  }
}

</style>
