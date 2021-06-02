import { ModelInterface } from '@/types/types';
import {
  DonuModelDefinition,
  DonuResponse,
  DonuRequest,
  DonuRequestCommand,
  DonuType,
} from '@/types/typesDonu';
import { donuToModel } from '@/utils/DonuUtil';

/** Send the request to Donu */
async function callDonu (request: DonuRequest): Promise<DonuResponse> {
  const response = await fetch(process.env.DONU_ENDPOINT, {
    body: JSON.stringify(request),
    method: 'POST',
  });
  return response.json() as DonuResponse;
}

/** Fetch a complete list of available models from Donu API */
export async function fetchDonuModels (): Promise<ModelInterface[]> {
  const request: DonuRequest = {
    command: DonuRequestCommand.LIST_MODELS,
  };
  const response = await callDonu(request);
  // TODO - transform DonuResponse into ModelInterface
  return donuToModel(response?.models) ?? null;
}

export async function getModelParameters (model: ModelInterface): Promise<DonuResponse> {
  const request: DonuRequest = {
    command: DonuRequestCommand.DESCRIBE_MODEL_INTERFACE,
    definition: {
      source: { file: model.metadata.source },
      type: DonuType.EASEL,
    } as DonuModelDefinition,
  };

  const response = await callDonu(request);
  // TODO - transform DonuResponse into ModelInterface
  return response;
}
