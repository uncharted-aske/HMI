import _ from 'lodash';
import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
import { MODEL_TYPE_OPTIONS } from '@/utils/ModelTypeUtil';
import { ModelInterface } from '@/types/types';

const isModelFiltered = (model: ModelInterface, filters: any): boolean => {
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

/** Return a filtered list of Graph Models */
function fetchGraphs (models: ModelInterface[], filters: any[]): ModelInterface[] {
  return models.filter(model => model.type === 'biomechanism' && !isModelFiltered(model, filters));
}

/** Return a filtered list of Computational Models */
function fetchModels (models: ModelInterface[], filters: any[]): ModelInterface[] {
  return models.filter(model => model.type === 'computational' && !isModelFiltered(model, filters));
}

const fetchModelTypesAgg = (models: ModelInterface[], filters: any[]): any => {
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

export {
  fetchGraphs,
  fetchModels,
  fetchModelTypesAgg,
};
