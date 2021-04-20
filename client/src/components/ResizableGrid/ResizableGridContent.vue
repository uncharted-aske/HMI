<template>
  <div
    class="panel-content d-flex position-absolute"
    :id="content.id"
    :style="style"
  >
    <div class="panel-content-border panel-content-border-bottom" @mousedown="(e) => handleMousedown(e, 'bottom')"/>
    <div class="panel-content-border panel-content-border-right" @mousedown="(e) => handleMousedown(e, 'right')"/>
    <div class="panel-content-border panel-content-border-left" @mousedown="(e) => handleMousedown(e, 'left')"/>
    <div class="panel-content-border panel-content-border-top" @mousedown="(e) => handleMousedown(e, 'top')"/>
    <slot/>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';
  import { ContentInterface } from '@/types/typesResizableGrid';

  @Component
  export default class ResizableGridContent extends Vue {
    @Prop({ default: {} as ContentInterface })
    content: ContentInterface;

    get style (): any {
      return {
        height: (this.content.height ?? 0) + 'px',
        left: (this.content.left ?? 0) + 'px',
        top: (this.content.top ?? 0) + 'px',
        width: (this.content.width ?? 0) + 'px',
      };
    }

    handleMousedown (e: MouseEvent, position: string): any {
      this.$emit('mousedown-border', e, this.content.id, position);
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

$border-select-margin: 10px;

.panel-content-border {
  position: absolute;
  user-select: none;
}

.panel-content-border-bottom { bottom: 0; }
.panel-content-border-right { right: 0; }
.panel-content-border-left { left: 0; }
.panel-content-border-top { top: 0; }

.panel-content-border-left,
.panel-content-border-right {
  cursor: col-resize;
  height: 100%;
  width: $border-select-margin;
}

.panel-content-border-top,
.panel-content-border-bottom {
  cursor: row-resize;
  height: $border-select-margin;
  width: 100%;
}
</style>
