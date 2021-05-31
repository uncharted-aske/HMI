/**
 * Filtres Storage
 *
 * This is to be concidered the source of thruth and the formating.
 */

import { Filtres, Filtre, FiltreField } from '@/types/typesFiltres';
import { GetterTree, ActionTree, MutationTree } from 'vuex';
import * as Route from '@/utils/RouteUtil';

const state = [] as unknown as Filtres;

const getters: GetterTree<Filtres, any> = {
  /** Return an Array of Filtres. */
  getFiltres (state): Filtres {
    return state;
  },

  /** Return a Filtre based on its field. */
  getFiltre: (state) => (field: FiltreField): Filtre => state.find(filtre => filtre.field === field) ?? null,
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
    const filtres = Route.getFiltres() ?? [] as Filtres;
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
    if (!state.some(f => filtre.field === f.field)) {
      state.push(filtre);
    } else {
      const currentFiltre = state.find(f => f.field === filtre.field);
      const updatedFiltre = { ...currentFiltre, ...filtre };
      state.push(updatedFiltre);
    }
    // Trigger change by providing new Set instance
    // Because @Watch does not refresh on elements changes of a Map(),
    // only the Map itself.
    // state = new Map(state);
    state = [...new Set(state)];
  },

  clearFiltres (state): void {
    // eslint-disable-next-line
    state = [] as Filtres;
  },

  removeFiltre (state, field: string): void {
    state = state.filter(f => f.field !== field);
  },

  setFiltre (state, filtres: Filtres): void {
    state = [...new Set(filtres)];
  },
};

export const filtres = {
  actions,
  getters,
  mutations,
  state,
};
