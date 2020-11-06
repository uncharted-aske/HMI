import { GetterTree, ActionTree } from 'vuex';
import _ from 'lodash';
import Router from '../../router';
import * as filtersUtil from '../../utils/FiltersUtil';
import { QueryState, Filters } from 'src/types/types';
import { Location } from 'vue-router';

const updateQuery = (getters: QueryState, filters: Filters): QueryState => {
  if (filtersUtil.isEmpty(filters)) filters = filtersUtil.newFilters();
  const _filters = filters || getters.filters;
  return {
    filters: JSON.stringify(_filters),
  };
};

const state: QueryState = {
  filters: '',
};

const getters: GetterTree<QueryState, any> = {
  getFilters: (state, getters, rootState): Filters => {
    const filters = rootState.route.query.filters;
    return _.isEmpty(filters) ? filtersUtil.newFilters() : JSON.parse(filters);
  },
};

const actions: ActionTree<QueryState, any> = {
  setFilters ({ getters }, filters) {
    const query = updateQuery(getters, filters);
    const location: Location = {};
    location.query = { filters: query.filters };
    Router.getRouter().push(location);
  },
  addTerm ({ getters }, { field, term, operand = 'or', isNot = false }) {
    const filters = _.cloneDeep(getters.getFilters);
    filtersUtil.addSearchTerm(filters, field, term, operand, isNot);
    const query = updateQuery(getters, filters);
    const location: Location = {};
    location.query = { filters: query.filters };
    Router.getRouter().push(location);
  },
  removeTerm ({ getters }, { field, term, operand = 'or', isNot = false }) {
    const filters = _.cloneDeep(getters.getFilters);
    filtersUtil.removeSearchTerm(filters, field, term, operand, isNot);
    const query = updateQuery(getters, filters);
    const location: Location = {};
    location.query = { filters: query.filters };
    Router.getRouter().push(location);
  },
};

export const query = {
  state,
  getters,
  actions,
};
