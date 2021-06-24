import _ from 'lodash';
// import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
// import { MODEL_TYPE_OPTIONS } from '@/utils/ModelTypeUtil';
import * as Model from '@/types/typesModel';
// import * as KnowledgeGraph from '@/types/typesKnowledgeGraph';
// import * as Lex from '@/types/typesLex';

// const isFiltered = (model: Model.Model | KnowledgeGraph.Graph, filters: Lex.Filters): boolean => {
//   if (!filters) return false;
//   return _.some(filters.clauses, clause => {
//     if (clause.field === QUERY_FIELDS_MAP.MODEL_TYPE.field) {
//       if (clause.isNot === false) {
//         // Filter if model type is not a value
//         return !_.some(clause.values, value => model.type === MODEL_TYPE_OPTIONS[value]);
//       } else {
//         // Filter if model type is a value
//         return _.some(clause.values, value => model.type === MODEL_TYPE_OPTIONS[value]);
//       }
//     }
//   });
// };

const fetchModelTypesAgg = (models: Model.Model[] /*, filters?: Lex.Filters */): any => {
  const result = _(models)
    .groupBy('type')
    .map((modelGroup, type) => {
      // const filteredModelGroup = modelGroup.filter(model => !isFiltered(model, filters));
      return {
        label: type,
        value: modelGroup.length,
        ratio: modelGroup.length / models.length,
      };
    })
    .value();
  return result;
};

export {
  fetchModelTypesAgg,
  // isFiltered,
};
