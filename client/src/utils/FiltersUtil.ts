import _ from 'lodash';
import { FilterOperand, Filter, Filters, QueryFieldKey, LexConvertTypeMapping, LexConvertType } from '@/types/types';

/**
 * Utility to construct search queries to pass through components, store and route.
 */

const isEmpty = (filters: Filters): boolean => {
  return _.isEmpty(filters) || _.isEmpty(filters.clauses);
};

/**
 * Return empty filters object
 */
const newFilters = (): Filters => {
  return { clauses: [] };
};

/**
 * Custom equality to check if two filters are the same, this is needed
 * as the clauses is an array of object and in some cases we cannot ensure
 * order.
 */
const isEqual = (a: Filters, b: Filters): boolean => {
  if (isEmpty(a) && isEmpty(b)) return true;
  if (a.clauses.length !== b.clauses.length) return false;

  for (let i = 0; i < a.clauses.length; i++) {
    const aClause = a.clauses[i];
    const foundItem = b.clauses.find(bClause => {
      return _.isEqual(aClause, bClause);
    });
    if (_.isNil(foundItem)) return false;
  }
  return true;
};

const findPositiveFacetClause = (filters: Filters, field: QueryFieldKey): Filter => {
  return _.find(filters.clauses, clause => {
    return clause.field === field && clause.isNot === false;
  });
};

const addSearchTerm = (filters: Filters, field: QueryFieldKey, term: LexConvertTypeMapping[LexConvertType], operand: FilterOperand, isNot: boolean): void => {
  const existingClause = _.find(filters.clauses, clause => {
    return clause.field === field &&
      clause.operand === operand &&
      clause.isNot === isNot;
  });

  if (!_.isNil(existingClause)) {
    // Check if term already in clause
    const existingValue = _.find(existingClause.values, value => {
      return value === term;
    });
    if (_.isNil(existingValue)) {
      existingClause.values.push(term);
    }
  } else {
    filters.clauses.push({
      field: field,
      operand: operand,
      isNot: isNot,
      values: [term],
    });
  }
};

const removeSearchTerm = (filters: Filters, field: QueryFieldKey, term: LexConvertTypeMapping[LexConvertType], operand: FilterOperand, isNot: boolean): void => {
  const existingClause = _.find(filters.clauses, clause => {
    return clause.field === field &&
      clause.operand === operand &&
      clause.isNot === isNot;
  });

  if (!_.isNil(existingClause)) {
    _.remove(existingClause.values, v => {
      return _.isEqual(v, term);
    });

    // If now empty remove clause
    if (_.isEmpty(existingClause.values)) {
      _.remove(filters.clauses, clause => {
        return clause.field === field &&
          clause.operand === operand &&
          clause.isNot === isNot;
      });
    }
  }
};

export {
  findPositiveFacetClause,
  addSearchTerm,
  removeSearchTerm,
  newFilters,
  isEmpty,
  isEqual,
};
