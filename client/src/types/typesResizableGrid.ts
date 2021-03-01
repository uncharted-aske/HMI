export interface DimensionsInterface {
    [key: string]: {
      width: string,
      widthFixed: boolean,
      // height: string,
      // heightFixed: boolean,
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
