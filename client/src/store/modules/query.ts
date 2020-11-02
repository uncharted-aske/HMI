import { GetterTree, ActionTree } from 'vuex';
import _ from 'lodash';
import { getRouter } from '../../router';
import filtersUtil from '../../utils/FiltersUtil';
import { QueryState } from 'src/types/types';

const updateQuery = (getters: QueryState, { filters }: QueryState): QueryState => {
  if (filtersUtil.isEmpty(filters)) filters = filtersUtil.newFilters();
  const _filters = filters || getters.getFilters;
  return {
    filters: JSON.stringify(_filters),
  };
};

const state: QueryState = {
  filters: '',
};

const getters: GetterTree<QueryState, any> = {
  getFilters: (state, getters, rootState) => {
    const filters = rootState.route.query.filters;
    return _.isEmpty(filters) ? filtersUtil.newFilters() : JSON.parse(filters);
  },
};

const actions: ActionTree<QueryState, any> = {
  setFilters ({ getters }, filters) {
    const query = updateQuery(getters, { filters });
    getRouter().push({ query });
  },
  addTerm ({ getters }, { field, term, operand = 'or', isNot = false }) {
    const filters = _.cloneDeep(getters.getFilters);
    filtersUtil.addSearchTerm(filters, field, term, operand, isNot);
    const query = updateQuery(getters, { filters });
    getRouter().push({ query });
  },
  removeTerm ({ getters }, { field, term, operand = 'or', isNot = false }) {
    const filters = _.cloneDeep(getters.getFilters);
    filtersUtil.removeSearchTerm(filters, field, term, operand, isNot);
    const query = updateQuery(getters, { filters });
    getRouter().push({ query });
  },
};

export const query = {
  state,
  getters,
  actions,
};
