<template>
  <div class="panel-content d-flex position-absolute" :style="style">
    <div class="panel-content-border panel-content-border-left" @mousedown="(e) => handleMousedown(e, 'left')"/>
    <div class="panel-content-border panel-content-border-right" @mousedown="(e) => handleMousedown(e, 'right')"/>
    <div class="panel-content-border panel-content-border-top" @mousedown="(e) => handleMousedown(e, 'top')"/>
    <div class="panel-content-border panel-content-border-bottom" @mousedown="(e) => handleMousedown(e, 'bottom')"/>
    <slot/>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  @Component
  export default class ResizableGridContent extends Vue {
    @Prop({ default: 0 })
    id: string;

    @Prop({ default: 0 })
    left: string;

    @Prop({ default: 0 })
    top: string;

    @Prop({ default: 0 })
    width: string;

    @Prop({ default: 0 })
    height: string;

    get style (): any {
      const { left, top, width, height } = this;
      return { left, top, width, height };
    }

    get slotName (): string {
      return this.id;
    }

    handleMousedown (e: MouseEvent, position: string): any {
      this.$emit('mousedown-border', e, this.id, position);
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

$border-select-margin: 10px;
$border-grid: 1px solid $border;

.panel-content-border {
  position: absolute;
  user-select: none;
}

.panel-content-border-left {
  left: 0;
  width: $border-select-margin;
  height: 100%;
  border-left: $border-grid;
  cursor: col-resize;
}
.panel-content-border-right {
  right: 0;
  width: $border-select-margin;
  height: 100%;
  border-right: $border-grid;
  cursor: col-resize;
}
.panel-content-border-top {
  top: 0;
  width: 100%;
  height: $border-select-margin;
  border-top: $border-grid;
  cursor: row-resize;
}
.panel-content-border-bottom {
  bottom: 0;
  width: 100%;
  height: $border-select-margin;
  border-bottom: $border-grid;
  cursor: row-resize;
}
</style>
