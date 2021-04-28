/**
 * Filtres Storage
 *
 * This is to be concidered the source of thruth and the formating.
 */

import { Filtres, Filtre, FiltreField } from '@/types/typesFiltres';
import { GetterTree, ActionTree, MutationTree } from 'vuex';
import * as Route from '@/utils/RouteUtil';

const state = new Map() as Filtres;

const getters: GetterTree<Filtres, any> = {
  /** Return an Array or Filtre. */
  getFiltres (state): Filtre[] {
    return Array.from(state.values());
  },

  /** Return a Filtre based on its field. */
  getFiltre (state, field: string): Filtre {
    return state.get(field) ?? null;
  },
};

const actions: ActionTree<Filtres, any> = {
  addFiltre ({ state, commit }, filtre: Filtre): void {
    commit('addFiltre', filtre);
    Route.updateFiltres(state);
  },

  clearFiltre ({ commit }): void {
    commit('clearFiltre');
    Route.clearFiltres();
  },

  removeFiltre ({ state, commit }, field: FiltreField): void {
    commit('removeFiltre', field);
    Route.updateFiltres(state);
  },

  setFiltre ({ commit }): void {
    const filtres = Route.getFiltres();
    if (filtres) {
      commit('setFiltre', filtres);
    }
  },

  updateFiltre ({ state, commit }, filtre: Filtre): void {
    if (filtre.values.length > 0) {
      commit('addFiltre', filtre);
    } else {
      commit('removeFiltre', filtre.field);
    }
    Route.updateFiltres(state);
  },
};

const mutations: MutationTree<Filtres> = {
  addFiltre (state, filtre: Filtre): void {
    state.set(filtre.field, filtre);
  },

  clearFiltres (state): void {
    state.clear();
  },

  removeFiltre (state, field: string): void {
    state.delete(field);
  },

  setFiltre (state, filtres: Filtres): void {
    state.clear();
    filtres.forEach(filtre => state.set(filtre.field, filtre));
  },
};

export {
  actions,
  getters,
  mutations,
  state,
};
