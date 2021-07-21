import * as Donu from '@/types/typesDonu';

interface ModelComponentMetadataInterface {
  name: string,
  description: string,
  expression: string,
  units: string,
  knowledge: string
}

interface TabInterface {
  name: string;
  icon: string;
  id: string;
}

interface ViewInterface {
  name: string;
  id: string;
}

interface CardInterface {
  id: number;
  previewImageSrc?: string,
  title: string;
  subtitle: string;
  type?: string;
  raw?: any;
  highlighted?: boolean;
  checked?: boolean;
}

interface GraferEventDetail extends Record<string, any> {
  layer: string;
  type: string;
  id: string;
}

type Counter = {
  name: string,
  value?: number,
  highlighted?: boolean,
  inverse?: boolean,
};

interface SimulationParameter extends Donu.ModelParameter {
  hidden?: boolean,
  values?: number[],
}

interface SimulationVariable extends Donu.ModelVariable {
  values: {x: number, y: number}[][], // List of runs, containing a list of coordinates.
  hidden: boolean,
}

type SimulationRun = {
  [key: string]: number,
};

export {
  CardInterface,
  Counter,
  GraferEventDetail,
  ModelComponentMetadataInterface,
  SimulationParameter,
  SimulationVariable,
  SimulationRun,
  TabInterface,
  ViewInterface,
};
