<template>
  <div
    class="panel-content"
    :id="content.id"
    :style="style"
  >
    <div
      v-if="!content.borderBottomDisable"
      class="panel-content-border panel-content-border-bottom"
      @mousedown="(e) => onMousedown(e, 'bottom')"
    />
    <div
      v-if="!content.borderRightDisable"
      class="panel-content-border panel-content-border-right"
      @mousedown="(e) => onMousedown(e, 'right')"
    />
    <div
      v-if="!content.borderLeftDisable"
      class="panel-content-border panel-content-border-left"
      @mousedown="(e) => onMousedown(e, 'left')"
    />
    <div
      v-if="!content.borderTopDisable"
      class="panel-content-border panel-content-border-top"
      @mousedown="(e) => onMousedown(e, 'top')"
    />
    <slot />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop } from 'vue-property-decorator';
  import { ContentInterface } from '@/types/typesResizableGrid';

  @Component
  export default class ResizableGridContent extends Vue {
    @Prop({ default: {} as ContentInterface }) content: ContentInterface;

    get style (): any {
      return {
        height: (this.content.height ?? 0) + 'px',
        left: (this.content.left ?? 0) + 'px',
        top: (this.content.top ?? 0) + 'px',
        width: (this.content.width ?? 0) + 'px',
      };
    }

    onMousedown (e: MouseEvent, position: string): any {
      this.$emit('mousedown-border', e, this.content.id, position);
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

$border-select-margin: 5px;

.panel-content {
  display: flex;
  position: absolute;
}

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
