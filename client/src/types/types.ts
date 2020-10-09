interface ModelInterface {
  id: number;
  metadata: ModelMetadataInterface,
  type: string
}

interface ModelMetadataInterface {
  name: string,
  description: string,
  created: string,
  source: string,
  version: string,
  knowledge: string,
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

interface Todo {
  text: string
}

export {
  ActionColumnInterface,
  CardInterface,
  ModelInterface,
  ModelMetadataInterface,
  ModelsState, 
  Todo,
};
