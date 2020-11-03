import _ from 'lodash';
import { QUERY_FIELDS_MAP } from '../utils/QueryFieldsUtil';
import { MODEL_TYPE_OPTIONS } from '../utils/ModelTypeUtil';

const isModelFiltered = (model: any, filters: any): boolean => {
  if (!filters) return false;
  return _.some(filters.clauses, clause => {
    if (clause.field === QUERY_FIELDS_MAP.MODEL_TYPE.field) {
      if (clause.isNot === false) {
        // Filter if model type is not a value
        return !_.some(clause.values, value => model.type === MODEL_TYPE_OPTIONS[value]);
      } else {
        // Filter if model type is a value
        return _.some(clause.values, value => model.type === MODEL_TYPE_OPTIONS[value]);
      }
    }
  });
};

const fetchModels = (models: Array<any>, filters: Array<any>): any => {
  return models.filter(model => !isModelFiltered(model, filters));
};

const fetchModelTypesAgg = (models: Array<any>, filters: Array<any>): any => {
  const result = _(models)
    .groupBy('type')
    .map((modelGroup, type) => {
      const filteredModelGroup = modelGroup.filter(model => !isModelFiltered(model, filters));
      return {
        label: type,
        value: filteredModelGroup.length,
        ratio: filteredModelGroup.length / models.length,
      };
    })
    .value();
  return result;
};

export default {
  fetchModels,
  fetchModelTypesAgg,
};
