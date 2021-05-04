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
  /** Return an Array of Filtres. */
  getFiltres (state): Filtres {
    return state;
  },

  /** Return a Filtre based on its field. */
  getFiltre: (state) => (field: FiltreField): Filtre => state.get(field) ?? null,
};

const actions: ActionTree<Filtres, any> = {
  addFiltre ({ state, commit }, filtre: Filtre): void {
    commit('addFiltre', filtre);
    Route.updateFiltres(state);
  },

  addFiltres ({ state, commit }, filtres: Filtres): void {
    filtres.forEach(filtre => commit('addFiltre', filtre));
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

  setFiltres ({ commit }, fields: string[]): void {
    // We check if the route as some
    const filtres = Route.getFiltres() ?? new Map() as Filtres;
    commit('setFiltre', filtres);

    // If fields are provided we add them.
    if (fields) {
      fields.forEach(field => commit('addFiltre', { field } as Filtre));
    }

    Route.updateFiltres(state);
  },
};

const mutations: MutationTree<Filtres> = {
  addFiltre (state, filtre: Filtre): void {
    if (!state.has(filtre.field)) {
      state.set(filtre.field, filtre);
    } else {
      const currentFiltre = state.get(filtre.field);
      const updatedFiltre = { ...currentFiltre, ...filtre };
      state.set(filtre.field, updatedFiltre);
    }
  },

  clearFiltres (state): void {
    state.clear();
  },

  removeFiltre (state, field: FiltreField): void {
    state.delete(field);
  },

  setFiltre (state, filtres: Filtres): void {
    state.clear();
    state = filtres;
  },
};

export {
  actions,
  getters,
  mutations,
  state,
};
