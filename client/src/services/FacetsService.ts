import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
import * as modelsService from './ModelsService';

const fetchFacets = (models: Array<any>, filters = []): any => {
  const result = {};
  result[QUERY_FIELDS_MAP.MODEL_TYPE.field] = modelsService.fetchModelTypesAgg(models, filters);
  result[QUERY_FIELDS_MAP.HISTOGRAM.field] = modelsService.fetchModelTypesAgg(models, filters);
  result[QUERY_FIELDS_MAP.TEXT.field] = modelsService.fetchModelTypesAgg(models, filters);
  return result;
};

export {
  fetchFacets,
};
