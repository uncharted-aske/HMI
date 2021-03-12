import { getUtilMem } from '@/utils/FetchUtil';

import { EmmaaModelInfoInterface, EmmaaEvidenceInterface } from '@/types/typesEmmaa';

/// /////////////////////////////////////////////

const EMMAA_MODEL_INFO = 'https://emmaa.indra.bio/model_info/';

export const emmaaModelInfo = (paramObj: {modelName: string}): Promise<EmmaaModelInfoInterface> => {
  return getUtilMem(EMMAA_MODEL_INFO + paramObj.modelName, {});
};

/// /////////////////////////////////////////////

const EMMAA_MODEL_LIST = 'https://emmaa.indra.bio/models';

export const emmaaModelList = async (): Promise<any> => {
  const modelList = await getUtilMem(EMMAA_MODEL_LIST, {});

  return await Promise.all(modelList.models.map(async (modelName) => {
    const response = await emmaaModelInfo({ modelName });
    return {
      name: response.human_readable_name,
      id: response.name,
      source: 'EMMAA',
      description: response.description,
    };
  }));
};

/// /////////////////////////////////////////////

const EMMAA_EVIDENCE = 'https://emmaa.indra.bio/evidence';

// eslint-disable-next-line camelcase
export const emmaaEvidence = (paramObj: {stmt_hash: number, source: string, model: string, format: string}): Promise<EmmaaEvidenceInterface> => {
  return getUtilMem(EMMAA_EVIDENCE, { format: 'json', ...paramObj });
};
