import Vue from 'vue';
import Vuex from 'vuex';

import { models } from './modules/models';

Vue.use(Vuex);

export const store = new Vuex.Store({
  modules: {
    models
  },
});
