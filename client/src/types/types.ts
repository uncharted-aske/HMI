interface ModelMetadataInterface {
  name: string,
  description: string,
  created: string,
  source: string,
  version: string,
  knowledge: string
}

interface ModelComponentMetadataInterface {
  name: string,
  description: string,
  expression: string,
  units: string,
  knowledge: string
}

interface GraphNodeInterface {
  id: string,
  concept: string,
  label: string,
  type: string,
  metadata: ModelComponentMetadataInterface
}

interface GraphEdgeInterface {
  id: string,
  source: string,
  target: string
}

interface GraphGroupInterface {
  id: string,
  members: string[]
}

interface ModelGraphInterface {
  nodes: GraphNodeInterface[],
  edges: GraphEdgeInterface[],
  groups: GraphGroupInterface[]
}

interface ModelInterface {
  id: number;
  metadata: ModelMetadataInterface,
  graph: ModelGraphInterface,
  type: string
}

interface ActionColumnInterface {
    name: string;
    icon: string;
    paneId: string;
}

interface CardInterface {
  id: number;
  previewImageSrc: string,
  title: string;
  subtitle: string;
  type: string;
}

interface ModelsState {
  selectedModelId: string,
  modelsList: ModelInterface[]
}

export {
  ActionColumnInterface,
  CardInterface,
  ModelInterface,
  ModelMetadataInterface,
  ModelsState,
  ModelGraphInterface,
  ModelComponentMetadataInterface,
  GraphNodeInterface,
  GraphEdgeInterface,
};
