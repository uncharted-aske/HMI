<template>
  <div class="position-relative flex-grow-1" ref="container">
    <resizable-grid-content
      v-for="content in contentArray" :key="content.id"
      :content="content"
      @mousedown-border="onMousedown"
    >
      <slot :name="content.id"/>
    </resizable-grid-content>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, Watch } from 'vue-property-decorator';
  import { isEqual, uniq } from 'lodash';

  import ResizableGridContent from './ResizableGridContent.vue';

  import {
    CellBorderInterface,
    CellDimensionsInterface,
    CellPositionInterface,
    ContentInterface,
    DimensionsInterface,
  } from '@/types/typesResizableGrid';

  type OppositeCells = {
    negative: string[],
    positive: string[],
  }

  // reverse the position of the key and values in an object, placing the former keys in an array
  // e.g. invertObject({x: 1, y: 1, z: 2}) ---> {1: ["x","y"], 2:["z"]}
  function invertObject (json: Record<string, any>): Record<string, any> {
    var ret = {};
    for (var key in json) {
      (ret[json[key]] = ret[json[key]] !== undefined ? ret[json[key]] : []).push(key);
    }
    return ret;
  }

  // finds all the keys which two objects have in common
  // e.g. unionObject({x: 1, y: 1, z: 2}, {x: 1, y: 2, a: 1}) ---> ["x", "y"]
  function commonObjectKeys (obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> {
    var keys = [];
    for (var i in obj1) {
      if (i in obj2) {
        keys.push(i);
      }
    }
    return keys;
  }

  function containsLetter (str) {
    return /[A-Za-z]+$/.test(str);
  }

  enum OPPOSING_DIRECTION_MAP {
    left = 'right',
    right = 'left',
    top = 'bottom',
    bottom = 'top',
  }

  const components = {
    ResizableGridContent,
  };

  @Component({ components })
  export default class ResizableGrid extends Vue {
    @Prop({ default: [[]] })
    map: string[][];

    @Prop({ default: () => ({}) })
    dimensions: DimensionsInterface;

    @Prop({ default: 10 })
    edgeBuffer: number;

    isDraggable: boolean = false;

    idSet: Set<string>;

    // cell positioning/displacement
    cellTopLeftX: CellPositionInterface;
    cellTopLeftY: CellPositionInterface;
    cellBotRightX: CellPositionInterface;
    cellBotRightY: CellPositionInterface;

    // cell neighbours, the cells bordering the current cell
    cellLeft: CellBorderInterface;
    cellRight: CellBorderInterface;
    cellTop: CellBorderInterface;
    cellBottom: CellBorderInterface;

    contentArray: ContentInterface[] = [];

    activeBorder: any;

    @Watch('map') onMapChange (newMap: string[][], oldMap: string[][]): any {
      if (!isEqual(newMap, oldMap)) {
        this.initializeMap();
      }
    }

    @Watch('dimensions') onDimensionsChange (newDim: DimensionsInterface, oldDim: DimensionsInterface): any {
      if (!isEqual(newDim, oldDim)) {
        this.initializeMap();
      }
    }

    constructor (...args: unknown[]) {
      super(...args);
      this.resetMapVariables();
    }

    get containerDim (): {width: number, height: number, top: number, left: number} {
      const { width, height, top, left } = this.$el
        ? this.$el.getBoundingClientRect()
        : { width: 0, height: 0, top: 0, left: 0 };
      return { width, height, top, left };
    }

    /** Return the dimensions of a cell */
    cellDim (id: string): CellDimensionsInterface {
      // Set some default.
      const defaultDim = {
        width: null,
        widthFixed: false,
        widthMax: 1,
        widthMin: 0,
        height: null,
        heightFixed: false,
        heightMax: 1,
        heightMin: 0,
      } as CellDimensionsInterface;

      // Fetch the dimensions set by the user.
      const dimensions = this.dimensions?.[id];
      if (dimensions) {
        return { ...defaultDim, ...dimensions };
      } else {
        return defaultDim;
      }
    }

    generateContentArray (): ContentInterface[] {
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
      window.addEventListener('mouseup', this.onMouseup);
      this.$el.addEventListener('mousemove', this.onMousemove);
      window.addEventListener('resize', this.onResize);

      this.initializeMap();
    }

    private resetMapVariables () {
      this.idSet = new Set();

      // cell positioning/displacement
      this.cellTopLeftX = {};
      this.cellTopLeftY = {};
      this.cellBotRightX = {};
      this.cellBotRightY = {};

      // cell neighbours
      this.cellLeft = {};
      this.cellRight = {};
      this.cellTop = {};
      this.cellBottom = {};

      this.contentArray = [];

      this.activeBorder = {};
    }

    private initializeMap () {
      if (!this.isMapValid()) {
        throw new Error('Invalid map detected');
      }

      this.resetMapVariables();

      const { width, height } = this.containerDim;

      // TO-DO: Add equivalent colAccumulatingTotal block for height
      const rowAccumulatingTotal = [];
      for (let rowInd = 0; rowInd < this.map.length; rowInd++) {
        rowAccumulatingTotal[rowInd] = [{ fixed: 0, variable: 0 }];
        let fixed = 0;
        let variable = 0;
        for (let colInd = 0; colInd < this.map[rowInd].length; colInd++) {
          const cellId = this.map[rowInd][colInd];
          const dimensionExists = this.dimensions[cellId];
          if (dimensionExists && this.dimensions[cellId].width && containsLetter(this.dimensions[cellId].width)) {
            fixed += parseFloat(this.dimensions[cellId].width);
          } else {
            variable += dimensionExists && this.dimensions[cellId].width !== undefined
              ? parseFloat(this.dimensions[cellId].width)
              : 1;
          }
          rowAccumulatingTotal[rowInd].push({ fixed, variable });
        }
      }

      for (let rowInd = 0; rowInd < this.map.length; rowInd++) {
        const rowUnit = height / (this.map ? this.map.length : 0);
        const colTotalNum = rowAccumulatingTotal[rowInd].length - 1;
        const colUnit = (width - rowAccumulatingTotal[rowInd][colTotalNum].fixed) / (rowAccumulatingTotal[rowInd][colTotalNum].variable);
        for (let colInd = 0; colInd < this.map[rowInd].length; colInd++) {
          const id = this.map[rowInd][colInd];
          if (!this.idSet.has(id)) {
            this.idSet.add(id);
          }
          if (this.isTopLeftCorner(colInd, rowInd)) {
            const widthTotal = rowAccumulatingTotal[rowInd][colInd];
            this.cellTopLeftX[id] = widthTotal.fixed + widthTotal.variable * colUnit;
            this.cellTopLeftY[id] = rowInd * rowUnit;
          }
          if (this.isBottomRightCorner(colInd, rowInd)) {
            const widthTotal = rowAccumulatingTotal[rowInd][colInd + 1];
            this.cellBotRightX[id] = widthTotal.fixed + widthTotal.variable * colUnit;
            this.cellBotRightY[id] = (rowInd + 1) * rowUnit;
          }
        }
      }

      const [cellLeft, cellRight] = this.findCommonBorders(this.cellTopLeftX, this.cellBotRightX, this.cellTopLeftY, this.cellBotRightY);
      const [cellTop, cellBottom] = this.findCommonBorders(this.cellTopLeftY, this.cellBotRightY, this.cellTopLeftX, this.cellBotRightX);
      this.cellLeft = cellLeft;
      this.cellRight = cellRight;
      this.cellTop = cellTop;
      this.cellBottom = cellBottom;

      this.contentArray = this.generateContentArray();
    }

    findCommonBorders (
      primaryCellTopLeft: CellPositionInterface,
      primaryCellBotRight: CellPositionInterface,
      secondaryCellTopLeft: CellPositionInterface,
      secondaryCellBotRight: CellPositionInterface,
    ): [{[key: string]: string[]}, {[key: string]: string[]}] {
      const primaryCellTopLeftInvert = invertObject(primaryCellTopLeft);
      const primaryCellBotRightInvert = invertObject(primaryCellBotRight);

      const primaryCell: {[key: string]: string[]} = {};
      const secondaryCell: {[key: string]: string[]} = {};

      commonObjectKeys(primaryCellTopLeftInvert, primaryCellBotRightInvert).map(cell => {
        primaryCellTopLeftInvert[cell].map(leftBorderId => primaryCellBotRightInvert[cell].map(rightBorderId => {
          if (secondaryCellTopLeft[leftBorderId] < secondaryCellBotRight[rightBorderId] &&
            secondaryCellTopLeft[rightBorderId] < secondaryCellBotRight[leftBorderId]) {
            (primaryCell[leftBorderId] = primaryCell[leftBorderId] ? primaryCell[leftBorderId] : []).push(rightBorderId);
            (secondaryCell[rightBorderId] = secondaryCell[rightBorderId] ? secondaryCell[rightBorderId] : []).push(leftBorderId);
          }
        }));
      });

      return [primaryCell, secondaryCell];
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

      const { positive, negative } = this.findActiveCells(id, position);
      // console.log('final result');
      // console.log({ positive, negative });
      this.activeBorder = {
        position,
        positive,
        negative,
      };
    }

    isWidthFixed (id: string): boolean {
      return Boolean(this.dimensions[id]?.widthFixed);
    }

    /** Return the list of cells that should move with and against the current cell id. */
    findActiveCell (id: string, direction: string, directionCellNeighbours: string[], visitedCells?: string[]): OppositeCells {
      const opposingDirection = OPPOSING_DIRECTION_MAP[direction];
      let positiveCells = [];
      let negativeCells = [];
      visitedCells.push(id);
      // console.group(id + ' ' + direction);
      // console.log('neighbours', directionCellNeighbours);

      if (directionCellNeighbours) {
        positiveCells.push(id);

        // If current cell is width fixed then add negative
        if (this.isWidthFixed(id)) {
          negativeCells.push(id);
        }

        // Now we move the neighbours in the same direction
        directionCellNeighbours.map(neighbourId => {
          if (visitedCells.includes(neighbourId)) {
            return;
          }

          const opposingCells = this.findActiveCells(neighbourId, opposingDirection, visitedCells);
          positiveCells = positiveCells.concat(opposingCells.negative);
          negativeCells = negativeCells.concat(opposingCells.positive);
        });
      }
      // console.groupEnd();
      return { positive: uniq(positiveCells), negative: uniq(negativeCells) };
    }

    /** Returns all the cells that needs to be moved based on a specified direction. */
    findActiveCells (id: string, position: string, visitedCells = []): OppositeCells {
      if (this.isWidthFixed(id)) {
        switch (position) {
          case 'left': {
            const left = this.findActiveCell(id, 'left', this.cellLeft[id], visitedCells);
            const right = this.findActiveCell(id, 'right', this.cellRight[id], visitedCells);
            return {
              // We move in a positive left the cell on our left and on our right
              positive: uniq(left.positive.concat(right.negative)),
              // opposite
              negative: uniq(left.negative.concat(right.positive)),
            } as OppositeCells;
          }
          case 'right': {
            const left = this.findActiveCell(id, 'left', this.cellLeft[id], visitedCells);
            const right = this.findActiveCell(id, 'right', this.cellRight[id], visitedCells);
            return {
              negative: uniq(right.negative.concat(left.positive)),
              positive: uniq(right.positive.concat(left.negative)),
            } as OppositeCells;
          }
          case 'top':
            return this.findActiveCell(id, 'top', this.cellTop[id], visitedCells);
          case 'bottom':
            return this.findActiveCell(id, 'bottom', this.cellBottom[id], visitedCells);
        }
      } else {
        switch (position) {
          case 'left':
            return this.findActiveCell(id, 'left', this.cellLeft[id], visitedCells);
          case 'right':
            return this.findActiveCell(id, 'right', this.cellRight[id], visitedCells);
          case 'top':
            return this.findActiveCell(id, 'top', this.cellTop[id], visitedCells);
          case 'bottom':
            return this.findActiveCell(id, 'bottom', this.cellBottom[id], visitedCells);
        }
      }
    }

    onMouseup (): void {
        this.isDraggable = false;
    }

    onMousemove (e: MouseEvent): void {
      if (this.isDraggable) {
        const { position, positive, negative } = this.activeBorder;
        const { movementX, movementY } = e;

        // If there is no movement
        if (movementX === 0 && movementY === 0) return;

        if (position === 'left') {
          this.adjustCellsFromTheLeft(positive, movementX);
          this.adjustCellsFromTheRight(negative, movementX);
        }
        if (position === 'right') {
          this.adjustCellsFromTheRight(positive, movementX);
          this.adjustCellsFromTheLeft(negative, movementX);
        }
        if (position === 'top') {
          this.adjustCellsFromTheTop(positive, movementY);
          this.adjustCellsFromTheBottom(negative, movementY);
        }
        if (position === 'bottom') {
          this.adjustCellsFromTheBottom(positive, movementY);
          this.adjustCellsFromTheTop(negative, movementY);
        }

        const [cellLeft, cellRight] = this.findCommonBorders(this.cellTopLeftX, this.cellBotRightX, this.cellTopLeftY, this.cellBotRightY);
        const [cellTop, cellBottom] = this.findCommonBorders(this.cellTopLeftY, this.cellBotRightY, this.cellTopLeftX, this.cellBotRightX);
        this.cellLeft = cellLeft;
        this.cellRight = cellRight;
        this.cellTop = cellTop;
        this.cellBottom = cellBottom;

        this.contentArray = this.generateContentArray();
      }
    }

    onResize (): void {
      // hack to force re-render
      // this.borderPosition = this.borderPosition + Math.random() * 0.0001;
    }

    /** Calculate the current width limitation of a cell based on its container. */
    cellWidthLimits (id: string): { min: number, max: number } {
      const { widthMin, widthMax } = this.cellDim(id);
      return {
        min: widthMin * this.containerDim.width,
        max: widthMax * this.containerDim.width,
      };
    }

    /** Calculate the current height limitation of a cell based on its container. */
    cellHeightLimits (id: string): { min: number, max: number } {
      const { heightMin, heightMax } = this.cellDim(id);
      return {
        min: heightMin * this.containerDim.height,
        max: heightMax * this.containerDim.height,
      };
    }

    adjustCellsFromTheLeft (cells: string[], movement: number): void {
      cells.forEach(id => {
        this.cellTopLeftX[id] = this.cellTopLeftX[id] + movement;
        /*
        // Find the new width of the cell
        const newX = this.cellTopLeftX[id] + movement;
        const newWidth = this.cellBotRightX[id] - newX;

        // If it's within the limits
        const limit = this.cellWidthLimits(id);
        if (limit.min <= newWidth && newWidth <= limit.max) {
          this.cellTopLeftX[id] = newX;
        }
        */
      });
    }

    adjustCellsFromTheRight (cells: string[], movement: number): void {
      cells.forEach(id => {
        this.cellBotRightX[id] = this.cellBotRightX[id] + movement;
        /*
        // Find the new width of the cell
        const newX = this.cellBotRightX[id] + movement;
        const newWidth = newX - this.cellTopLeftX[id];

        // If it's within the limits
        const limit = this.cellWidthLimits(id);
        if (limit.min <= newWidth && newWidth <= limit.max) {
          this.cellBotRightX[id] = newX;
        }
        */
      });
    }

    adjustCellsFromTheTop (cells: string[], movement: number): void {
      cells.forEach(id => {
        this.cellTopLeftY[id] = this.cellTopLeftY[id] + movement;
        /*
        // Find the new height of the cell
        const newY = this.cellTopLeftY[id] + movement;
        const newHeight = this.cellBotRightY[id] - newY;

        // Update the height if it's within the limits
        const limit = this.cellHeightLimits(id);
        if (limit.min <= newHeight && newHeight <= limit.max) {
          this.cellTopLeftY[id] = newY;
        }
        */
      });
    }

    adjustCellsFromTheBottom (cells: string[], movement: number): void {
      cells.forEach(id => {
        this.cellBotRightY[id] = this.cellBotRightY[id] + movement;
        /*
        // Find the new height of the cell
        const newY = this.cellBotRightY[id] + movement;
        const newHeight = newY - this.cellTopLeftY[id];

        // Update the height if it's within the limits
        const limit = this.cellHeightLimits(id);
        if (limit.min <= newHeight && newHeight <= limit.max) {
          this.cellBotRightY[id] = newY;
        }
        */
      });
    }
  }
</script>
