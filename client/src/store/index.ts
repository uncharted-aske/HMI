import Vue from 'vue';
import Vuex from 'vuex';

import * as filtres from './modules/filtres';
import * as knowledgeGraph from './modules/knowledgeGraph';
import * as model from './modules/model';
import * as query from './modules/query';
import * as simulation from './modules/simulation';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    filtres,
    knowledgeGraph,
    model,
    query,
    simulation,
  },
});

// Initialize state
store.dispatch('setInitialModelsState');
store.dispatch('setInitialKnowledgeGraphState');

export { store };
