<template>
  <div class="position-relative flex-grow-1" ref="container">
    <resizable-divider-content v-for="(content) in contentArray" :key="content.id"
      :id="content.id"
      :left="content.left + 'px'"
      :top="content.top + 'px'"
      :width="content.width + 'px'"
      :height="content.height + 'px'"
      @mousedown-border="onMousedown"
    >
      <slot :name="content.id"/>
    </resizable-divider-content>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop } from 'vue-property-decorator';

  import ResizableDividerContent from './ResizableDividerContent.vue';

  interface cellPositionInterface {
    [key: string]: number,
  }

  interface cellBorderInterface {
    [key: string]: string[],
  }

  interface contentInterface {
    id: string,
    left: number,
    top: number,
    width: number,
    height: number,
  }

  function swap (json: Record<string, any>): Record<string, any> {
    var ret = {};
    for (var key in json) {
      (ret[json[key]] = ret[json[key]] !== undefined ? ret[json[key]] : []).push(key);
    }
    return ret;
  }

  function commonKeys (obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> {
    var keys = [];
    for (var i in obj1) {
      if (i in obj2) {
        keys.push(i);
      }
    }
    return keys;
  }

  const components = {
    ResizableDividerContent,
  };

  @Component({ components })
  export default class ResizableDivider extends Vue {
    @Prop({ })
    rows: number;

    @Prop({ })
    cols: number;

    @Prop({ })
    map: string[][];

    @Prop({ default: 10 })
    edgeBuffer: number;

    isDraggable: boolean = false;

    idSet: Set<string> = new Set();

    cellTopLeftX: cellPositionInterface = {};
    cellTopLeftY: cellPositionInterface = {};
    cellBotRightX: cellPositionInterface = {};
    cellBotRightY: cellPositionInterface = {};

    cellLeft: cellBorderInterface = {};
    cellRight: cellBorderInterface = {};
    cellTop: cellBorderInterface = {};
    cellBot: cellBorderInterface = {};

    contentArray: contentInterface[] = [];

    clickInitPosX: number = 0;
    clickInitPosY: number = 0;
    clickDispPosX: number = 0;
    clickDispPosY: number = 0;

    get containerDim (): {width: number, height: number, top: number, left: number} {
      const { width, height, top, left } = this.$el
        ? this.$el.getBoundingClientRect()
        : { width: 0, height: 0, top: 0, left: 0 };
      return { width, height, top, left };
    }

    generateContentArray (): contentInterface[] {
      const output = [];
      for (const id of this.idSet) {
        output.push({
          id,
          left: this.cellTopLeftX[id],
          top: this.cellTopLeftY[id],
          width: this.cellBotRightX[id] - this.cellTopLeftX[id],
          height: this.cellBotRightY[id] - this.cellTopLeftY[id],
        });
      }

      return output;
    }

    // incomplete - validate that all shapes in the map are rectangular and connected
    isMapValid (): boolean {
      return true;
    }

    mounted (): void {
      if (!this.isMapValid()) {
        throw new Error('Invalid map detected');
      }

      window.addEventListener('mouseup', this.onMouseup);
      this.$el.addEventListener('mousemove', this.onMousemove);
      window.addEventListener('resize', this.onResize);

      const { width, height } = this.containerDim;
      const rowNum = this.map ? this.map.length : 0;
      const colNum = this.map && this.map[0] ? this.map[0].length : 0;
      const rowUnit = height / rowNum;
      const colUnit = width / colNum;

      for (let rowInd = 0; rowInd < this.map.length; rowInd++) {
        for (let colInd = 0; colInd < this.map[rowInd].length; colInd++) {
          const id = this.map[rowInd][colInd];
          if (!this.idSet.has(id)) {
            this.idSet.add(id);
          }
          if (this.isTopLeftCorner(colInd, rowInd)) {
            this.cellTopLeftX[id] = colInd * colUnit;
            this.cellTopLeftY[id] = rowInd * rowUnit;
          }
          if (this.isBottomRightCorner(colInd, rowInd)) {
            this.cellBotRightX[id] = (colInd + 1) * colUnit;
            this.cellBotRightY[id] = (rowInd + 1) * rowUnit;
          }
        }
      }

      const [cellLeft, cellRight] = this.findCommonBorders(this.cellTopLeftX, this.cellBotRightX, this.cellTopLeftY, this.cellBotRightY);
      const [cellTop, cellBot] = this.findCommonBorders(this.cellTopLeftX, this.cellBotRightX, this.cellTopLeftY, this.cellBotRightY);
      this.cellLeft = cellLeft;
      this.cellRight = cellRight;
      this.cellTop = cellTop;
      this.cellBot = cellBot;

      this.contentArray = this.generateContentArray();
    }

    findCommonBorders (
      cellTopLeftA: cellPositionInterface,
      cellBotRightA: cellPositionInterface,
      cellTopLeftB: cellPositionInterface,
      cellBotRightB: cellPositionInterface,
    ): [{[key: string]: string[]}, {[key: string]: string[]}] {
      const cellTopLeftXInvert = swap(cellTopLeftA);
      const cellBotRightXInvert = swap(cellBotRightA);

      const cellA: {[key: string]: string[]} = {};
      const cellB: {[key: string]: string[]} = {};

      commonKeys(cellTopLeftXInvert, cellBotRightXInvert).map(val => {
        const leftBorderMap = cellTopLeftXInvert[val];
        const rightBorderMap = cellBotRightXInvert[val];

        leftBorderMap.map(leftBorderId => rightBorderMap.map(rightBorderId => {
          if (cellTopLeftB[leftBorderId] < cellBotRightB[rightBorderId] &&
            cellTopLeftB[rightBorderId] < cellBotRightB[leftBorderId]) {
              (cellA[leftBorderId] = cellA[leftBorderId] ? cellA[leftBorderId] : []).push(rightBorderId);
              (cellB[rightBorderId] = cellB[rightBorderId] ? cellB[rightBorderId] : []).push(leftBorderId);
            }
        }));
      });

      return [cellA, cellB];
    }

    isTopLeftCorner (col: number, row: number): boolean {
      const id = this.map[row][col];
      return (col === 0 || this.map[row][col - 1] !== id) && (row === 0 || this.map[row - 1][col] !== id);
    }

    isBottomRightCorner (col: number, row: number): boolean {
      const id = this.map[row][col];
      return (col === this.map[row].length - 1 || this.map[row][col + 1] !== id) &&
      (row === this.map.length - 1 || this.map[row + 1][col] !== id);
    }

    beforeDestroy (): void {
      window.removeEventListener('mouseup', this.onMouseup);
      this.$el.removeEventListener('mousemove', this.onMousemove);
      window.removeEventListener('resize', this.onResize);
    }

    onMousedown (e: MouseEvent, id: string, position: string): void {
        this.isDraggable = true;
        const { left, top } = this.containerDim;
        this.clickInitPosX = e.clientX - left;
        this.clickInitPosY = e.clientY - top;
        this.clickDispPosX = 0;
        this.clickDispPosY = 0;

        this.findActiveBorders(id, position);
    }

    // incomplete - part of the border resize logic
    findActiveBorders (id: string, position: string): any {
      const positiveBorders = [];
      const negativeBorders = [];

      if (position === 'left') {
        positiveBorders.push(id);
        let state = 1;
        let unprocessedIds = new Set();
        unprocessedIds.add(id);
        const traversedIds = new Set();
        while (state) {
          if (state === 1) {
            state = 0;
            const queuedIds = new Set();
            unprocessedIds.forEach((leftId: string) => {
              if (!traversedIds.has(leftId)) {
                state = -1;
                negativeBorders.push(leftId);
                traversedIds.add(leftId);
                if (this.cellLeft[leftId]) this.cellLeft[leftId].map(val => queuedIds.add(val));
                unprocessedIds.delete(leftId);
              }
            });
            unprocessedIds = queuedIds;
          } else if (state === -1) {
            state = 0;
            const queuedIds = new Set();
            unprocessedIds.forEach((leftId: string) => {
              if (!traversedIds.has(leftId)) {
                state = 1;
                positiveBorders.push(leftId);
                traversedIds.add(leftId);
                if (this.cellRight[leftId]) this.cellRight[leftId].map(val => queuedIds.add(val));
                unprocessedIds.delete(leftId);
              }
            });
            unprocessedIds = queuedIds;
          }
        }
      }
    }

    onMouseup (): void {
        this.isDraggable = false;
    }

    onMousemove (e: MouseEvent): void {
      if (this.isDraggable) {
        this.clickDispPosX += e.movementX;
        this.clickDispPosY += e.movementY;
      }
    }

    onResize (): void {
      // hack to force re-render
      // this.borderPosition = this.borderPosition + Math.random() * 0.0001;
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
}

.panel-content {
  overflow: hidden;
  flex: 1;
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
