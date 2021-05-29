import { ModelInterface } from '@/types/types';
import {
  DonuModelDefinition,
  DonuResponse,
  DonuRequest,
  DonuRequestCommand,
} from '@/types/typesDonu';
import { donuToModel } from '@/utils/DonuUtil';

const { DONU_ENDPOINT } = process.env;

/** Send the request to Donu */
async function callDonu (request: DonuRequest): Promise<DonuResponse> {
  const response = await fetch(DONU_ENDPOINT, {
    body: JSON.stringify(request),
    method: 'POST',
  });
  return response.json() as DonuResponse;
}

/** Fetch a complete list of available models from Donu API */
export async function fetchModels (): Promise<ModelInterface[]> {
  const request: DonuRequest = {
    command: DonuRequestCommand.LIST_MODELS,
  };
  const response = await callDonu(request);
  // TODO - transform DonuResponse into ModelInterface
  return donuToModel(response?.models);
}

export async function getModelParameters (model: ModelInterface): Promise<DonuResponse> {
  const request: DonuRequest = {
    command: DonuRequestCommand.DESCRIBE_MODEL_INTERFACE,
    definition: {
      source: { file: model.file },
      type: model.type,
    } as DonuModelDefinition,
  };

  const response = await callDonu(request);
  // TODO - transform DonuResponse into ModelInterface
  return response;
}
