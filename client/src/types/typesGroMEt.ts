/**
 * Define Types used for GroMET
 */

/* eslint-disable camelcase */

type Provenance = {
  metadata_type: string,
  method: string,
  timestamp: string,
};

type FileId = {
  name: string,
  path: string,
  uid: string,
}

export enum CodeType {
  CodeBlock = 'CODE_BLOCK',
  Identifier = 'IDENTIFIER',
}

export enum MetadateType {
  ModelInterface = 'ModelInterface',
  CodeCollectionReference = 'CodeCollectionReference',
  CodeSpanReference = 'CodeSpanReference',
  TextualDocumentReferenceSet = 'TextualDocumentReferenceSet',
}

export interface Metadata {
  metadata_type: MetadateType,
  provenance: Provenance,
  uid: string,
}

export interface ModelInterface extends Metadata {
  initial_conditions: Record<number, string>[],
  parameters: Record<number, string>[],
  variables: Record<number, string>[],
}

export interface CodeCollectionInterface extends Metadata {
  fileIds: FileId[],
  globalReferenceId: {id: string, type: string},
}

export interface CodeSpanReference extends Metadata {
  code_type: CodeType,
  file_id: string,
  line_begin: number,
  line_end: number,
  col_begin: number,
  col_end: number,
}

export interface TextualDocumentReferenceSet extends Metadata {
  documents: any,
}
