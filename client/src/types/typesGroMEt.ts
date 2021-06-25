/**
 * Define Types used for GroMET
 */

type Provenance = {
  metadata_type: string, // eslint-disable-line
  method: string,
  timestamp: string,
};

type FileId = {
  name: string,
  path: string,
  uid: string,
}

export enum MetadateType {
  ModelInterface = 'ModelInterface',
  CodeCollectionReference = 'CodeCollectionReference',
  TextualDocumentReferenceSet = 'TextualDocumentReferenceSet',
}

export interface Metadata {
  metadata_type: MetadateType, // eslint-disable-line
  provenance: Provenance,
  uid: string,
}

export interface ModelInterface extends Metadata {
  initial_conditions: Record<number, string>[], // eslint-disable-line
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
