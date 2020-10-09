interface ModelInterface {
  id: number;
  metadata: ModelMetadataInterface[],
}

interface ModelMetadataInterface {
  name: string,
  description: string,
  source: string,
  version: string,
  docs: string,
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
  // modelsList: ModelInterface[]
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
