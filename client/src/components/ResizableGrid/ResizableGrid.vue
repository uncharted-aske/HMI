<template>
  <div class="position-relative flex-grow-1" ref="container">
    <resizable-grid-content
      v-for="content in contentArray" :key="content.id"
      :content="content"
      @mousedown-border="onMousedown"
    >
      <slot :name="content.id" />
    </resizable-grid-content>
  </div>
</template>

<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import { Prop, ProvideReactive, Watch } from 'vue-property-decorator';
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

  type DOMdimensions = {
    top: number,
    left: number
    width: number,
    height: number,
  };

  // reverse the direction of the key and values in an object, placing the former keys in an array
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
    @Prop({ default: [[]] }) map: string[][];
    @Prop({ default: () => ({}) }) dimensions: DimensionsInterface;
    @Prop({ default: 10 }) edgeBuffer: number;

    @ProvideReactive() resized: boolean = false; // eslint-disable-line new-cap

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

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    resizeOberver: ResizeObserver;
    resizeTimeout: ReturnType<typeof setTimeout>;

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

    @Watch('isDraggable') onIsDraggableChange (isDraggable: boolean, wasDraggable: boolean): void {
      this.resized = wasDraggable && !isDraggable;
    }

    constructor (...args: unknown[]) {
      super(...args);
      this.resetMapVariables();
    }

    private containerDim (): DOMdimensions {
      const { width, height, top, left } = this.$el
        ? this.$el.getBoundingClientRect()
        : { width: 0, height: 0, top: 0, left: 0 };
      return { width, height, top, left };
    }

    /** Return the dimensions of a cell */
    private cellDim (id: string): CellDimensionsInterface {
      // Set some default.
      const defaultDim = {
        width: null,
        widthFixed: false,
        widthMax: 0.75,
        widthMin: 0.25,
        height: null,
        heightFixed: false,
        heightMax: 0.75,
        heightMin: 0.25,
      } as CellDimensionsInterface;

      // Fetch the dimensions set by the user.
      const dimensions = this.dimensions?.[id];
      if (dimensions) {
        return { ...defaultDim, ...dimensions };
      } else {
        return defaultDim;
      }
    }

    private generateContentArray (): ContentInterface[] {
      const output = [];
      const { width, height } = this.containerDim();
      for (const id of this.idSet) {
        output.push({
          id,
          left: this.cellTopLeftX[id],
          top: this.cellTopLeftY[id],
          width: this.cellBotRightX[id] - this.cellTopLeftX[id],
          height: this.cellBotRightY[id] - this.cellTopLeftY[id],
          borderLeftDisable: this.cellTopLeftX[id] === 0,
          borderRightDisable: this.cellBotRightX[id] === width,
          borderTopDisable: this.cellTopLeftY[id] === 0,
          borderBottomDisable: this.cellBotRightY[id] === height,
        });
      }

      return output;
    }

    // incomplete - validate that all shapes in the map are rectangular and connected
    private isMapValid (): boolean {
      return true;
    }

    private mounted (): void {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.resizeOberver = new ResizeObserver(this.onResize);
      this.resizeOberver.observe(this.$el);
      window.addEventListener('mouseup', this.onMouseup);
      this.$el.addEventListener('mousemove', this.onMousemove);

      this.initializeMap();
    }

    private beforeDestroy (): void {
      this.resizeOberver.disconnect();
      window.removeEventListener('mouseup', this.onMouseup);
      this.$el.removeEventListener('mousemove', this.onMousemove);
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

      const { width, height } = this.containerDim();

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

    private isTopLeftCorner (col: number, row: number): boolean {
      const id = this.map[row][col];
      return (col === 0 || this.map[row][col - 1] !== id) && (row === 0 || this.map[row - 1][col] !== id);
    }

    private isBottomRightCorner (col: number, row: number): boolean {
      const id = this.map[row][col];
      return (col === this.map[row].length - 1 || this.map[row][col + 1] !== id) &&
      (row === this.map.length - 1 || this.map[row + 1][col] !== id);
    }

    /** Find if all cells are immobile, by being against a side of the grid container, or an immobile cell. */
    private isCellStuck (cells: OppositeCells, direction: string): boolean {
      if (['left', 'top'].includes(direction)) {
        return cells.negative.every(id => this.isCellFixed(id, direction));
      } else {
        return cells.positive.every(id => this.isCellFixed(id, direction));
      }
    }

    /** Return the list of cells that should move with and against the current cell id. */
    private findActiveCell (id: string, direction: string, directionCellNeighbours: string[], visitedCells?: string[]): OppositeCells {
      const opposingDirection = OPPOSING_DIRECTION_MAP[direction];
      let positiveCells = [];
      let negativeCells = [];
      visitedCells.push(id);

      if (directionCellNeighbours) {
        positiveCells.push(id);

        // If current cell is width fixed then add negative
        if (this.isCellFixed(id, direction)) {
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

      return { positive: uniq(positiveCells), negative: uniq(negativeCells) };
    }

    /** Which axis a cell is fixed based on direction. i.e. width for left right direction. */
    private isCellFixed (id: string, direction: string) {
      return ['left', 'right'].includes(direction)
        ? this.cellDim(id).widthFixed
        : this.cellDim(id).heightFixed;
    }

    /** Returns all the cells that needs to be moved based on a specified direction. */
    private findActiveCells (id: string, direction: string, visitedCells = []): OppositeCells {
      const findTopActiveCell = () => this.findActiveCell(id, 'top', this.cellTop[id], visitedCells);
      const findLeftActiveCell = () => this.findActiveCell(id, 'left', this.cellLeft[id], visitedCells);
      const findRightActiveCell = () => this.findActiveCell(id, 'right', this.cellRight[id], visitedCells);
      const findBottomActiveCell = () => this.findActiveCell(id, 'bottom', this.cellBottom[id], visitedCells);

      const args: any = {};
      switch (direction) {
        case 'left':
          args.concurrentCells = findLeftActiveCell;
          args.opposingCells = findRightActiveCell;
          break;
        case 'right':
          args.concurrentCells = findRightActiveCell;
          args.opposingCells = findLeftActiveCell;
          break;
        case 'top':
          args.concurrentCells = findTopActiveCell;
          args.opposingCells = findBottomActiveCell;
          break;
        case 'bottom':
          args.concurrentCells = findBottomActiveCell;
          args.opposingCells = findTopActiveCell;
          break;
      }

      // Get the cell that move in the same direction
      const concurrent = args.concurrentCells();
      // But if we are dealing with a fixed cell, we add the cell in the opposite direction
      if (this.isCellFixed(id, direction)) {
        const opposing = args.opposingCells();
        return {
          // i.e. We move in a positive left the cell on our left and on our right
          positive: uniq(concurrent.positive.concat(opposing.negative)),
          negative: uniq(concurrent.negative.concat(opposing.positive)),
        } as OppositeCells;
      } else {
        return concurrent;
      }
    }

    private isCellsMovementXLegal (cells: string[], movementX: number, direction: string, isPositive: boolean) {
      return cells.every(id => {
        if (this.cellDim(id).widthFixed) return true;

        const limit = this.cellWidthLimits(id);
        const currentWidth = this.cellBotRightX[id] - this.cellTopLeftX[id];
        const adjustedX = movementX * (isPositive ? 1 : -1);

        const newWidth = direction !== 'right'
          // If adjusting from the left border then the element will shrink when the mouse movement vector is positive
          ? this.cellBotRightX[id] - (this.cellTopLeftX[id] + adjustedX)
          // If adjusting from the right border then the element will grow when the mouse movement vector is positive
          : (this.cellBotRightX[id] + adjustedX) - this.cellTopLeftX[id];

        return !(newWidth <= limit.min || newWidth >= limit.max) || // The cell is going out of limits OR
          (currentWidth <= limit.min && newWidth > currentWidth) || // Want to grow out of the min limit OR
          (currentWidth >= limit.max && newWidth <= currentWidth); // Want to shrink out of the max limit
      });
    }

    private isCellsMovementYLegal (cells: string[], movementY: number, direction: string, isPositive: boolean) {
      return cells.every(id => {
        if (this.cellDim(id).heightFixed) return true;

        const limit = this.cellHeightLimits(id);
        const currentHeight = this.cellBotRightY[id] - this.cellTopLeftY[id];
        const adjustedY = movementY * (isPositive ? 1 : -1);

        const newHeight = direction !== 'bottom'
          // If adjusting from the top border then the element will shrink when the mouse movement vector is positive
          ? this.cellBotRightY[id] - (this.cellTopLeftY[id] + adjustedY)
          // If adjusting from the bottom border then the element will grow when the mouse movement vector is positive
          : (this.cellBotRightY[id] + adjustedY) - this.cellTopLeftY[id];

        return !(newHeight <= limit.min || newHeight >= limit.max) || // The cell is going out of limits OR
          (currentHeight <= limit.min && newHeight > currentHeight) || // Want to grow out of the min limit OR
          (currentHeight >= limit.max && newHeight <= currentHeight); // Want to shrink out of the max limit
      });
    }

    /** Check if a movement is legal based on cell min/max limitations */
    private isMovementLegal (direction: string, cells: OppositeCells, movement: { movementX: number, movementY: number }): boolean {
      const { movementX, movementY } = movement;
      const { positive, negative } = cells;

      if (['left', 'right'].includes(direction) && movementX !== 0) {
        return this.isCellsMovementXLegal(positive, movementX, direction, true) &&
          this.isCellsMovementXLegal(negative, movementX, direction, false);
      } else if (['top', 'bottom'].includes(direction) && movementY !== 0) {
        return this.isCellsMovementYLegal(positive, movementY, direction, true) &&
          this.isCellsMovementYLegal(negative, movementY, direction, false);
      } else {
        return false;
      }
    }

    // When the user select a border
    private onMousedown (e: MouseEvent, id: string, direction: string): void {
      const target = e.target as HTMLElement;
      if (target.classList.contains('panel-content-border')) {
        this.isDraggable = true;

        const { positive, negative } = this.findActiveCells(id, direction);
        const cellStuck = this.isCellStuck({ positive, negative }, direction);
        this.activeBorder = {
          direction,
          positive: cellStuck ? [] : positive,
          negative: cellStuck ? [] : negative,
        };
      }
    }

    private onMouseup (): void {
      this.isDraggable = false;
    }

    private onMousemove (e: MouseEvent): void {
      if (this.isDraggable) {
        const { movementX, movementY } = e;
        // If there is no movement
        if (movementX === 0 && movementY === 0) {
          return;
        }

        const { direction, positive, negative } = this.activeBorder;
        if (!this.isMovementLegal(direction, { positive, negative }, { movementX, movementY })) {
          return;
        }

        switch (direction) {
          case 'left':
            this.adjustCellsFromTheLeft(positive, movementX);
            this.adjustCellsFromTheRight(negative, movementX);
            break;
          case 'right':
            this.adjustCellsFromTheRight(positive, movementX);
            this.adjustCellsFromTheLeft(negative, movementX);
            break;
          case 'top':
            this.adjustCellsFromTheTop(positive, movementY);
            this.adjustCellsFromTheBottom(negative, movementY);
            break;
          case 'bottom':
            this.adjustCellsFromTheBottom(positive, movementY);
            this.adjustCellsFromTheTop(negative, movementY);
            break;
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

    private onResize (): void {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(this.initializeMap, 300);
    }

    /** Calculate the current width limitation of a cell based on its container. */
    private cellWidthLimits (id: string): { min: number, max: number } {
      const { widthMin, widthMax } = this.cellDim(id);
      const { width } = this.containerDim();
      return {
        min: Math.floor(widthMin * width),
        max: Math.ceil(widthMax * width),
      };
    }

    /** Calculate the current height limitation of a cell based on its container. */
    private cellHeightLimits (id: string): { min: number, max: number } {
      const { heightMin, heightMax } = this.cellDim(id);
      const { height } = this.containerDim();
      return {
        min: Math.floor(heightMin * height),
        max: Math.ceil(heightMax * height),
      };
    }

    private adjustCellsFromTheLeft (cells: string[], movement: number): void {
      cells.forEach(id => {
        this.cellTopLeftX[id] = this.cellTopLeftX[id] + movement;
      });
    }

    private adjustCellsFromTheRight (cells: string[], movement: number): void {
      cells.forEach(id => {
        this.cellBotRightX[id] = this.cellBotRightX[id] + movement;
      });
    }

    private adjustCellsFromTheTop (cells: string[], movement: number): void {
      cells.forEach(id => {
        this.cellTopLeftY[id] = this.cellTopLeftY[id] + movement;
      });
    }

    private adjustCellsFromTheBottom (cells: string[], movement: number): void {
      cells.forEach(id => {
        this.cellBotRightY[id] = this.cellBotRightY[id] + movement;
      });
    }
  }
</script>
