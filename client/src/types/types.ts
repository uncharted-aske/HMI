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

interface GraferEventDetail {
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
  edited?: boolean, // the parameter is edited or not
  hidden?: boolean, // the parameter is visible or not
  values?: number[],
}

// List of runs, containing a list of coordinates.
type SimulationVariableValues = Array<{x: number, y: number}>;

interface SimulationVariable extends Donu.ModelVariable {
  aggregate: SimulationVariableValues,
  hidden: boolean,
  values: SimulationVariableValues[],
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
  SimulationRun,
  SimulationVariable,
  SimulationVariableValues,
  TabInterface,
  ViewInterface,
};
