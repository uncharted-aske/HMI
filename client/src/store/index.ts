import Vue from 'vue';
import Vuex from 'vuex';

import * as simulation from './modules/simulation';
import * as filtres from './modules/filtres';
import { models } from './modules/models';
import { query } from './modules/query';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    simulation,
    filtres,
    models,
    query,
  },
});

// Initialize state
store.dispatch('setInitialModelsState');

export { store };
