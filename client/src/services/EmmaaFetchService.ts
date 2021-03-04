import { getUtilMem } from '@/utils/FetchUtil';

/// /////////////////////////////////////////////

const EMMAA_MODEL_INFO = 'https://emmaa.indra.bio/model_info/';

export const emmaaModelInfo = (paramObj: {modelName: string}): Promise<any> => {
  return getUtilMem(EMMAA_MODEL_INFO + paramObj.modelName, {});
};

/// /////////////////////////////////////////////

const EMMAA_MODEL_LIST = 'https://emmaa.indra.bio/models';
const modelNameBlacklist = ['covid19'];

export const emmaaModelList = async (): Promise<any> => {
  const modelList = await getUtilMem(EMMAA_MODEL_LIST, {});
  modelList.models = modelList.models.filter(modelName => !modelNameBlacklist.includes(modelName));

  return await Promise.all(modelList.models.map(async (modelName) => {
    const response = await emmaaModelInfo({ modelName });
    return {
      name: response.human_readable_name,
      source: response.description,
    };
  }));
};
