interface ModelMetadataInterface {
  name: string,
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
}

export {
  TabInterface,
  ViewInterface,
  ModelInterface,
  ModelMetadataInterface,
  ModelComponentMetadataInterface,
  ModelsState,
  CardInterface,
};
