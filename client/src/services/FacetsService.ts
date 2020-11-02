import { CODE_TABLE } from '../utils/CodeUtil';
import modelsService from './ModelsService';

const fetchFacets = (models: Array<any>, filters = []): any => {
  const result = {};
  result[CODE_TABLE.MODEL_TYPE.field] = modelsService.fetchModelTypesAgg(models, filters);
  return result;
};

export default {
  fetchFacets,
};
