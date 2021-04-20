export interface DimensionsInterface {
    [key: string]: {
      /* Width */
      width: string,
      widthFixed: boolean,
      widthMax: number, // between 0 and 1
      widthMin: number, // between 0 and 1

      /* Height */
      height: string,
      heightFixed: boolean,
      heightMax: number, // between 0 and 1
      heightMin: number, // between 0 and 1
    }
  }

export interface CellPositionInterface {
  [key: string]: number,
}

export interface CellBorderInterface {
  [key: string]: string[],
}

export interface ContentInterface {
  id: string,
  left: number,
  top: number,
  width: number,
  height: number,
}
