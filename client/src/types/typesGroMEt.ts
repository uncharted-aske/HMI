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

type IndraAgentReference = {
  db_refs: Record<string, string>,
  name: string,
};

export enum CodeType {
  CodeBlock = 'CODE_BLOCK',
  Identifier = 'IDENTIFIER',
}

export enum MetadataType {
  CodeCollectionReference = 'CodeCollectionReference',
  CodeSpanReference = 'CodeSpanReference',
  EquationDefinition = 'EquationDefinition',
  ModelInterface = 'ModelInterface',
  TextDefinition = 'TextDefinition',
  TextParameter = 'TextParameter',
  TextualDocumentReferenceSet = 'TextualDocumentReferenceSet',
  IndraAgentReferenceSet = 'IndraAgentReferenceSet',
  ReactionReference = 'ReactionReference',
  EquationParameter = 'EQUATION_PARAMETER',
  Domain = 'DOMAIN',
}

export interface Metadata {
  metadata_type: MetadataType,
  provenance: Provenance,
  uid?: string,
  type?: MetadataType,
}

export interface ModelInterface extends Metadata {
  initial_conditions: Record<number, string>[],
  parameters: Record<number, string>[],
  variables: Record<number, string>[],
}

export interface CodeCollectionInterface extends Metadata {
  file_ids: FileId[],
  global_reference_id: {id: string, type: string},
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

export interface EquationDefinition extends Metadata {
  equation_extraction: {
    document_reference_uid: string,
    equation_number: number,
    equation_source_latex: string,
    equation_source_mml: string,
  }
}
export interface EquationParameter extends Metadata {
  equation_extraction: {
    document_reference_uid: string,
    equation_number: number,
    source_type: string,
  },
  value: string,
  variable_identifier: string,
}

export interface Domain extends Metadata {
  measurement_scale: string,
  data_type: string,
}

export interface TextDefinition extends Metadata {
  text_extraction: {
    document_reference_uid: string,
    page: number,
    block: number,
    char_begin: number,
    char_end: number
  },
  variable_identifier: string,
  variable_definition: string,
}

export interface TextParameter extends Metadata {
  text_extraction: {
    document_reference_uid: string,
    page: number,
    block: number,
    char_begin: number,
    char_end: number
  },
  variable_identifier: string,
  value: string,
}

export interface IndraAgentReferenceSet extends Metadata {
  indra_agent_references: IndraAgentReference[],
}

export interface ReactionReference extends Metadata {
  reaction_rule: string,
  indra_stmt_hash: number,
  is_reverse: false,
}
