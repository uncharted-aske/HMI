/**
 * Define Types used for GroMET
 */

type Provenance = {
  metadataType: string,
  method: string,
  timestamp: Date,
};

type FileId = {
  name: string,
  path: string,
  uid: string,
}

interface Metadata {
  metadataType: string,
  provenance: Provenance,
  uid: string,
}

export interface ModelInterface extends Metadata {
  initialConditions: Record<number, string>[],
  parameters: Record<number, string>[],
  variables: Record<number, string>[],
}

export interface CodeCollectionInterface extends Metadata {
  fileIds: FileId[],
  globalReferenceId: {id: string, type: string},
}

export interface TextualDocumentReferenceSet extends Metadata {
  documents: any,
}
