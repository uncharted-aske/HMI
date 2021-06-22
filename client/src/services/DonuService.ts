import { ModelInterface } from '@/types/types';
import * as Donu from '@/types/typesDonu';
import { donuToModel } from '@/utils/DonuUtil';
import { postUtil } from '@/utils/FetchUtil';

/** Send the request to Donu */
const callDonu = (request: Donu.Request): Promise<Donu.Response> => {
  try {
    return postUtil(process.env.DONU_ENDPOINT, request);
  } catch (error) {
    console.error('[DONU Service] — callDonu', error); // eslint-disable-line no-console
  }
};

/** Fetch a complete list of available models from Donu API */
export const fetchDonuModels = async (): Promise<any[]> => {
  const request: Donu.Request = {
    command: Donu.RequestCommand.LIST_MODELS,
  };

  const response = await callDonu(request);
  if (response.status === Donu.ResponseStatus.success) {
    const models = response?.result as Donu.ModelDefinition[] ?? null;
    return donuToModel(models);
  } else {
    console.error('[DONU Service] — fetchDonuModels', response); // eslint-disable-line no-console
  }
};

/** Fetch the parameters of a model */
export const getModelParameters = async (model: any): Promise<Donu.ModelParameter[]> => {
  if (!model) return;

  const request: Donu.Request = {
    command: Donu.RequestCommand.DESCRIBE_MODEL_INTERFACE,
    definition: {
      source: { file: model.metadata.source },
      type: model.metadata.type as Donu.Type,
    } as Donu.ModelDefinition,
  };

  const response = await callDonu(request);
  if (response.status === Donu.ResponseStatus.success) {
    const result = response?.result as Donu.ModelDefinition;
    return result?.parameters ?? null;
  } else {
    console.error('[DONU Service] — getModelParameters', response); // eslint-disable-line no-console
  }
};

/** Fetch the state variable of a model */
export const getModelVariables = async (model: any): Promise<Donu.ModelVariable[]> => {
  if (!model) return;

  const request: Donu.Request = {
    command: Donu.RequestCommand.DESCRIBE_MODEL_INTERFACE,
    definition: {
      source: { file: model.metadata.source },
      type: model.metadata.type as Donu.Type,
    } as Donu.ModelDefinition,
  };

  const response = await callDonu(request);
  if (response.status === Donu.ResponseStatus.success) {
    const result = response?.result as Donu.ModelDefinition;
    return result?.stateVars ?? null;
  } else {
    console.error('[DONU Service] — getModelVariables', response); // eslint-disable-line no-console
  }
};

/** Fetch the result of a model simulation */
export const getModelResult = async (
  model: ModelInterface,
  parameters: Donu.RequestParameters,
  config: Donu.RequestConfig,
): Promise<Donu.SimulationResponse> => {
  const request: Donu.Request = {
    command: Donu.RequestCommand.SIMULATE,
    definition: {
      source: { file: model.metadata.source },
      type: model.metadata.type,
    } as Donu.ModelDefinition,
    parameters: parameters,
    end: config.end,
    start: config.start,
    step: config.step,
  };

  const response = await callDonu(request);
  if (response.status === Donu.ResponseStatus.success) {
    return response?.result as Donu.SimulationResponse ?? null;
  } else {
    console.error('[DONU Service] — getModelResult', response); // eslint-disable-line no-console
  }
};
