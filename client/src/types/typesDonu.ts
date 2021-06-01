/** Donu API types
 * https://galoisinc.github.io/ASKE-E/donu.html
 */

export enum DonuRequestCommand {
  // CONVERT_MODEL = 'convert-model',
  DESCRIBE_MODEL_INTERFACE = 'describe-model-interface',
  // GET_MODEL_SCHEMATIC = 'get-model-schematic',
  // GET_MODEL_SOURCE = 'get-model-source',
  LIST_MODELS = 'list-models',
  // SIMULATE = 'simulate',
  // UPLOAD_MODEL = 'upload-model',
}

export enum DonuType {
  EASEL = 'easel',
  // DIFF_EQ = 'diff-eq',
  // GROMET = 'gromet',
}

type DonuMetadata = {
  Description: string,
}

type DonuModelVariable = {
  metadata: DonuMetadata,
  name: string,
}

export type DonuModelParameter = {
  defaultValue: number,
  metadata: DonuMetadata,
  name: string,
}

type DonuDataSource = {
  file: string;
}

export type DonuModelDefinition = {
  description?: string,
  name?: string,
  parameters?: DonuModelParameter[],
  source: DonuDataSource,
  stateVars?: DonuModelVariable[],
  type: DonuType;
}

export type DonuRequest = {
  command: DonuRequestCommand;
  definition?: string | DonuModelDefinition;
  // 'dest-type'?: string;
  end?: number;
  // name?: string;
  start?: number;
  step?: number;
  // type?: string;
}

export enum DonuResponseStatus {
  success = 'success',
  failure = 'failure',
}

export type DonuResponse = {
  error?: string,
  models?: DonuModelDefinition[],
  result?: DonuModelDefinition,
  status?: DonuResponseStatus,
}
