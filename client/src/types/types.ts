interface ModelMetadataInterface {
  name: string,
  id?: string,
  description?: string,
  created?: string,
  source?: string,
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

interface ModelInterface {
  id: number;
  metadata: ModelMetadataInterface,
  graph: any,
  subgraph?: any,
  type: string
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
  parameters?: any,
  comparisonHighlights?: any,
}

interface CardInterface {
  id: number;
  previewImageSrc?: string,
  title: string;
  subtitle: string;
  type: string;
  raw: any;
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

export {
  CardInterface,
  Counter,
  GraferEventDetail,
  ModelComponentMetadataInterface,
  ModelInterface,
  ModelMetadataInterface,
  ModelsState,
  TabInterface,
  ViewInterface,
};
