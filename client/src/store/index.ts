import Vue from 'vue';
import Vuex from 'vuex';

import { app } from './modules/app';
import { models } from './modules/models';


Vue.use(Vuex);

export const store = new Vuex.Store({
  modules: {
    app,
    models,
  },
});
