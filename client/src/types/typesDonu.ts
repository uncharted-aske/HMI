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

type SimulationResponse = {
  times: number[],
  values: {
    [key: string]: number[],
  }
}

type RequestParameters = {
  [key: string]: number[],
}

type RequestConfig = {
  end: number;
  start: number;
  step: number;
}

type Request = {
  command: RequestCommand;
  definition?: string | ModelDefinition;
  parameters?: RequestParameters,
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

type ResponseResult =
  ModelDefinition |
  ModelDefinition[] |
  SimulationResponse
;

type Response = {
  error?: string,
  result?: ResponseResult,
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
  RequestConfig,
  RequestParameters,
  Response,
  ResponseStatus,
  SimulationResponse,
  Type,
};
