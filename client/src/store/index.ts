import Vue from 'vue';
import Vuex from 'vuex';

import * as filters from './modules/filters';
import { models } from './modules/models';
import { query } from './modules/query';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    filters,
    models,
    query,
  },
});

// Initialize state
store.dispatch('setInitialModelsState');

export { store };
