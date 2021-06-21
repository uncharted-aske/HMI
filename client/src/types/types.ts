import * as Donu from '@/types/typesDonu';
import * as Graph from '@/types/typesGraphs';

interface ModelMetadataInterface {
  name: string,
  id?: string,
  description?: string,
  created?: string,
  source?: string,
  type?: string, // Mostly used by DonuType
  version?: string,
  knowledge?: string
}

interface ModelComponentMetadataInterface {
  name: string,
  description: string,
  expression: string,
  units: string,
  knowledge: string
}

export enum ModelInterfaceType {
  computational = 'computational',
  biomechanism = 'biomechanism',
}

/* Define a graph (nodes and edges) per type of a model. */
type ModelGraph = {
  file: string,
  type: 'PetriNetClassic' | 'FunctionNetwork',
  metadata?: any,
  graph: Graph.GraphInterface,
};

interface ModelInterface {
  id: number,
  name: string,
  modelGraph?: ModelGraph[],
}

// TODO revise this in the future with typesGraphs.ts and how to implement it.
interface KnowledgeGraphInterface {
  id?: number;
  metadata: ModelMetadataInterface,
  graph?: any,
  subgraph?: any,
  type: ModelInterfaceType
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

interface ModelsState {
  isInitialized: boolean,
  selectedModelIds: Set<string>,
  modelsList: ModelInterface[],
  selectedModelGraph?: number,
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
  hidden?: boolean,
  values?: number[],
}

interface SimulationVariable {
  values: {x: number, y: number}[][],
  hidden: boolean,
  name: string,
}

type SimulationRun = {
  [key: string]: number,
};

export {
  CardInterface,
  Counter,
  GraferEventDetail,
  ModelComponentMetadataInterface,
  ModelInterface,
  KnowledgeGraphInterface,
  ModelMetadataInterface,
  ModelsState,
  SimulationParameter,
  SimulationVariable,
  SimulationRun,
  TabInterface,
  ViewInterface,
};
