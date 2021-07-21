/* eslint camelcase: 0 */

/** Donu API types
 * https://galoisinc.github.io/ASKE-E/donu.html
 */

enum RequestCommand {
  // CONVERT_MODEL = 'convert-model',
  DESCRIBE_MODEL_INTERFACE = 'describe-model-interface',
  // GET_MODEL_SCHEMATIC = 'get-model-schematic',
  GET_MODEL_SOURCE = 'get-model-source',
  LIST_MODELS = 'list-models',
  SIMULATE = 'simulate',
  // UPLOAD_MODEL = 'upload-model',
}

enum Type {
  CORE = 'core',
  DIFF_EQS = 'diff-eqs',
  EASEL = 'easel',
  GROMET_PNC = 'gromet-pnc',
  GROMET_FN = 'gromet-fnet',
  GROMET_PRT = 'gromet-prt',
}

type Metadata = {
  description?: string,
  group?: string,
  name: string,
  type: string,
}

type ModelVariable = {
  metadata: Metadata,
  uid: string,
  value_type: string,
}

type ModelParameter = {
  default: number,
  metadata: Metadata,
  uid: string,
  value_type: string,
}

type DataSource = {
  file?: string;
  model?: string;
}

type ModelDefinition = {
  description?: string,
  name?: string,
  parameters?: ModelParameter[],
  source: DataSource,
  measures?: ModelVariable[],
  type: Type;
}

// TO-DO: Export GroMEt type from research/gromet/tools/types/GroMEt
type ModelGraph = any;

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
  ModelGraph |
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
  ModelGraph,
  SimulationResponse,
  Type,
};
