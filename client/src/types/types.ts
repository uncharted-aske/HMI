/* eslint camelcase: 0 */

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

type ExtractDataParameter = Array<{
  date: string,
  doi: string,
  location: string,
  object_id: string,
  value: number | string,
}>;

type ExtractDataParameters = {
  [key: string]: ExtractDataParameter,
};

/** Simulation types */

interface SimulationParameter extends Donu.ModelParameter {
  displayed?: boolean, // the parameter is visible or not
  values?: number[],
  initial_condition?: boolean, // a quick way to know if the parameter is an initial condition
}

// List of runs, containing a list of coordinates.
type SimulationVariableValues = Array<{x: number, y: number}>;

interface SimulationVariable extends Donu.ModelVariable {
  displayed?: boolean,
  aggregate: SimulationVariableValues,
  values: SimulationVariableValues[],
  polygon?: SimulationVariableValues,
}

type SimulationRun = {
  [key: string]: number,
};

type SimulationModel = {
  id: number,
  initialised: boolean,
  parameters: SimulationParameter[],
  variables: SimulationVariable[],
}

type SimulationState = {
  numberOfSavedRuns: number,
  models: SimulationModel[],
}

/** Export */

export {
  CardInterface,
  Counter,
  GraferEventDetail,
  ModelComponentMetadataInterface,
  ExtractDataParameters,
  ExtractDataParameter,
  SimulationModel,
  SimulationParameter,
  SimulationRun,
  SimulationState,
  SimulationVariable,
  SimulationVariableValues,
  TabInterface,
  ViewInterface,
};
