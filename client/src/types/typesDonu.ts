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
  QUERY_MODELS = 'query-models',
  SIMULATE = 'simulate',
  // UPLOAD_MODEL = 'upload-model',
  LIST_DATASETS = 'list-datasets',
  GET_DATASET = 'get-dataset',
  COMPUTE_ERROR = 'compute-error',
  FIT_MEASURES = 'fit-measures',
}

enum Type {
  CORE = 'core',
  DIFF_EQS = 'diff-eqs',
  EASEL = 'easel',
  GROMET_PNC = 'gromet-pnc',
  GROMET_FN = 'gromet-fnet',
  GROMET_PRT = 'gromet-prt',
}

enum SimulationType {
  ALGEBRAIC_JULIA = 'aj', // Supports petri net classic models
  DISCRETE = 'discrete', // Supports discrete models
  GSL = 'gsl', // Supports petri net classic and place/transition net models
  AUTOMATES = 'automates', // Supports functional networks
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

type Measure = {
  uid: string,
  predicted: {
    times: number[],
    values: number[]
  },
  observed: {
    times: number[],
    values: number[],
  }
};

type MeasureError = {
  uid: string,
  error_ind: number[],
  error_total: number,
};

enum ErrorModelTypes {
  L2 = 'L2',
}

enum InterpolationModelTypes {
  Linear = 'linear',
}

// TO-DO: Export GroMEt type from research/gromet/tools/types/GroMEt
type ModelGraph = any;

type SimulationResponse = {
  // `domain_parameter` and `times` are identical,
  domain_parameter?: number[], // for Functional Network,
  times?: number[], // for Petri Net Classic.
  values: {
    [key: string]: number[],
  }
}

type ComputeErrorResponse = {
  measures: MeasureError[],
  error_total: number,
}

type ListDatasetsResponse = {
  source: {
    model: string,
  },
  name: string,
  description: string,
}

type GetDatasetResponse = {
  name: string,
  description: string,
  columns: [{
    values: number[],
    name: string,
    description: string,
  }]
}

type FitMeasuresResponse = {
  [parameter: string]: number,
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
  parameters?: RequestParameters | string[],
  'interp-model'?: InterpolationModelTypes,
  'error-model'?: ErrorModelTypes,
  // 'dest-type'?: string;
  outputs?: string[],
  domain_parameter?: string,
  end?: number;
  start?: number;
  step?: number;
  'sim-type'?: SimulationType | void,
  text?: string,
  // type?: string;
  source?: {
    model: string,
  },
  measures?: any,
  data?: any,
}

enum ResponseStatus {
  success = 'success',
  failure = 'failure',
}

type ResponseResult =
  ModelGraph |
  ModelDefinition |
  ModelDefinition[] |
  SimulationResponse |
  ComputeErrorResponse |
  ListDatasetsResponse[] |
  GetDatasetResponse |
  FitMeasuresResponse
;

type Response = {
  error?: string,
  result?: ResponseResult,
  status?: ResponseStatus,
}

export {
  ComputeErrorResponse,
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
  ListDatasetsResponse,
  GetDatasetResponse,
  FitMeasuresResponse,
  Type,
  SimulationType,
  Measure,
  MeasureError,
  ErrorModelTypes,
  InterpolationModelTypes,
};
