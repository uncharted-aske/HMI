/**
 * Filters Storage
 *
 * This is to be concidered the source of thruth and the formating.
 */

import { Filters, Filter, FilterField } from '@/types/typesFilters';
import { GetterTree, ActionTree, MutationTree } from 'vuex';
import * as Route from '@/utils/RouteUtil';

const state = new Map() as Filters;

const getters: GetterTree<Filters, any> = {
  /** Return an Array or Filter. */
  getFilters (state): Filter[] {
    return Array.from(state.values());
  },

  /** Return a Filter based on its field. */
  getFilter (state, field: string): Filter {
    return state.get(field) ?? null;
  },
};

const actions: ActionTree<Filters, any> = {
  addFilter ({ state, commit }, filter: Filter): void {
    commit('addFilter', filter);
    Route.updateFilters(state);
  },

  clearFilter ({ commit }): void {
    commit('clearFilter');
    Route.clearFilters();
  },

  removeFilter ({ state, commit }, field: FilterField): void {
    commit('removeFilter', field);
    Route.updateFilters(state);
  },

  setFilter ({ commit }): void {
    const filters = Route.getFilters();
    if (filters) {
      commit('setFilter', filters);
    }
  },

  updateFilter ({ state, commit }, filter: Filter): void {
    if (filter.values.length > 0) {
      commit('addFilter', filter);
    } else {
      commit('removeFilter', filter.field);
    }
    Route.updateFilters(state);
  },
};

const mutations: MutationTree<Filters> = {
  addFilter (state, filter: Filter): void {
    state.set(filter.field, filter);
  },

  clearFilters (state): void {
    state.clear();
  },

  removeFilter (state, field: string): void {
    state.delete(field);
  },

  setFilter (state, filters: Filters): void {
    state.clear();
    filters.forEach(filter => state.set(filter.field, filter));
  },
};

export {
  actions,
  getters,
  mutations,
  state,
};
