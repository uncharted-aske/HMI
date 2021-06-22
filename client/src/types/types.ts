import * as Donu from '@/types/typesDonu';
import * as Graph from '@/types/typesGraphs';
import * as GroMEt from '@/types/typesGroMEt';

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

/* Define a graph (nodes and edges) per type of a model. */
type ModelGraph = {
  file: string,
  type: 'PetriNetClassic' | 'FunctionNetwork',
  metadata?: Array<GroMEt.ModelInterface | GroMEt.CodeCollectionInterface | GroMEt.TextualDocumentReferenceSet >,
  graph: Graph.GraphInterface,
};

interface ModelInterface {
  id: number,
  name: string,
  modelGraph?: ModelGraph[],
  metadata?: ModelMetadataInterface,
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
  ModelInterface,
  ModelMetadataInterface,
  ModelsState,
  SimulationParameter,
  SimulationVariable,
  SimulationRun,
  TabInterface,
  ViewInterface,
};
