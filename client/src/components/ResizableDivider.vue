<template>
  <div class="resizable-divider-container">
    <div
      class="resizable-divider left"
      :class="[isDraggable ? 'active' : '']"
      :style="dividerLeftStyle"
    >

      <div class="panel-content">
          <slot name="content-left" />
      </div>
    </div>

    <div class="divider"
      :style="dividerStyle"
    >
      <button
        class="btn"
        @mousedown="onMousedown"
      >
        <font-awesome-icon :icon="['fas', 'arrows-alt-h' ]" />
      </button>
    </div>

    <div
      class="resizable-divider right"
      :class="[isDraggable ? 'active' : '']"
      :style="dividerRightStyle"
    >

      <div class="panel-content">
          <slot name="content-right" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  @Component
  export default class ResizableDivider extends Vue {
    @Prop({ default: true })
    left: boolean;

    @Prop({ default: true })
    right: boolean;

    @Prop({ default: true })
    alwaysFull: boolean;

    @Prop({ default: 10 })
    edgeBuffer: number;

    isDraggable: boolean = false;
    borderPosition: number = this.getDocWidth() / 2;
    clickOffset: number = 0;

    get displayDivider (): boolean {
      if (this.alwaysFull) {
        return this.left && this.right;
      } else {
        return this.left || this.right;
      }
    }

    get dividerLeftStyle (): any {
      return {
        display: this.left ? 'flex' : 'none',
        width: this.getWidth(false),
      };
    }

    get dividerStyle (): any {
      return {
        display: this.displayDivider ? 'flex' : 'none',
        left: this.getWidth(false),
      };
    }

    get dividerRightStyle (): any {
      return {
        display: this.right ? 'flex' : 'none',
        width: this.getWidth(true),
      };
    }

    mounted (): void {
      document.addEventListener('mouseup', this.onMouseup);
      document.addEventListener('mousemove', this.onMousemove);
      window.addEventListener('resize', this.onResize);
    }

    beforeDestroy (): void {
      document.removeEventListener('mouseup', this.onMouseup);
      document.removeEventListener('mousemove', this.onMousemove);
      window.removeEventListener('resize', this.onResize);
    }

    onMousedown (e: MouseEvent): void {
        this.isDraggable = true;
        this.clickOffset = e.clientX - this.borderPosition;
        this.borderPosition = this.borderPosition + this.clickOffset;
    }

    onMouseup (): void {
        this.isDraggable = false;
        this.borderPosition = this.borderPosition - this.clickOffset;
        this.clickOffset = 0;
    }

    onMousemove (e: MouseEvent): void {
      const mousePos = e.clientX;
      if (this.isDraggable && mousePos >= this.edgeBuffer && mousePos <= this.getDocWidth() - this.edgeBuffer) {
        this.borderPosition = mousePos;
      }
    }

    onResize (): void {
      this.$forceUpdate();
    }

    getDocWidth (): number {
      return document.documentElement.clientWidth ||
        document.body.clientWidth;
    }

    getWidth (isRight: boolean): string {
      const rightEnabled = this.right && !this.left;
      const leftEnabled = this.left && !this.right;
      let output = 0;

      if (isRight) {
        if (this.alwaysFull && rightEnabled) {
          output = this.getDocWidth();
        } else if (this.alwaysFull && leftEnabled) {
          output = 0;
        } else {
          output = this.getDocWidth() - this.borderPosition + this.clickOffset;
        }
      } else {
        if (this.alwaysFull && leftEnabled) {
          output = this.getDocWidth();
        } else if (this.alwaysFull && rightEnabled) {
          output = 0;
        } else {
          output = this.borderPosition - this.clickOffset;
        }
      }

      return output + 'px';
    }
  }
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.resizable-divider {
  height: $content-full-height;
  position: absolute;
  flex-direction: column;
  background-color: #ffffff;
  box-sizing: border-box;
  z-index: map-get($z-index-order, resizable-divider);
  will-change: transform;
  &.left {
    left: 0;
  }
  &.right {
    right: 0;
  }
}

.panel-content {
  overflow: hidden;
}

.divider {
  width: 1px;
  height: $content-full-height;
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
  z-index: map-get($z-index-order, resizable-divider) + 1;
  background-color: $border;
  box-shadow: 0 4px 8px 0 $border;
  will-change: transform;
  .btn {
    height: 75px;
    min-width: 20px;
    margin-top: -37.5px;
    margin-left: -10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff;
    padding: 5px;
    box-shadow: 0 -1px 0 #e5e5e5, 0 0 2px rgba(0,0,0,.12), 0 2px 4px rgba(0,0,0,.24);
    &:hover {
      background-color: $muted-highlight;
    }
  }
}

</style>
