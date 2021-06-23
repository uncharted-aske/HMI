import Vue from 'vue';
import Vuex from 'vuex';

import * as filtres from './modules/filtres';
import * as knowledgeGraph from './modules/knowledgeGraph';
import * as models from './modules/models';
import * as query from './modules/query';
import * as simulation from './modules/simulation';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    filtres,
    knowledgeGraph,
    models,
    query,
    simulation,
  },
});

// Initialize state
store.dispatch('models/setInitialModelsState');
store.dispatch('knowledgeGraph/setInitialState');

export { store };
