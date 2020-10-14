<template>
  <div class="drilldown-panel-container">
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

    @Watch('paneTitle')
    onPropertyChanged(value: string, oldValue: string) {
      console.log(value);
    }

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
}

</style>
