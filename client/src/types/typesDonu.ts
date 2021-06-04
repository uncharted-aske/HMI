/** Donu API types
 * https://galoisinc.github.io/ASKE-E/donu.html
 */

enum RequestCommand {
  // CONVERT_MODEL = 'convert-model',
  DESCRIBE_MODEL_INTERFACE = 'describe-model-interface',
  // GET_MODEL_SCHEMATIC = 'get-model-schematic',
  // GET_MODEL_SOURCE = 'get-model-source',
  LIST_MODELS = 'list-models',
  SIMULATE = 'simulate',
  // UPLOAD_MODEL = 'upload-model',
}

enum Type {
  EASEL = 'easel',
  // DIFF_EQ = 'diff-eq',
  // GROMET = 'gromet',
}

type Metadata = {
  Description: string,
}

type ModelVariable = {
  metadata: Metadata,
  name: string,
}

type ModelParameter = {
  defaultValue: number,
  metadata: Metadata,
  name: string,
}

type DataSource = {
  file: string;
}

type ModelDefinition = {
  description?: string,
  name?: string,
  parameters?: ModelParameter[],
  source: DataSource,
  stateVars?: ModelVariable[],
  type: Type;
}

type Request = {
  command: RequestCommand;
  definition?: string | ModelDefinition;
  // 'dest-type'?: string;
  end?: number;
  // name?: string;
  start?: number;
  step?: number;
  // type?: string;
}

enum ResponseStatus {
  success = 'success',
  failure = 'failure',
}

type Response = {
  error?: string,
  models?: ModelDefinition[],
  result?: ModelDefinition,
  status?: ResponseStatus,
}

export {
  DataSource,
  Metadata,
  ModelDefinition,
  ModelParameter,
  ModelVariable,
  Request,
  RequestCommand,
  Response,
  ResponseStatus,
  Type,
};
