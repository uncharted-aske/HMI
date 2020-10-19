import { GetterTree, MutationTree } from 'vuex';

import { AppState } from '../../types/types';

const state: AppState = {
    currentView: null,
};
  
  const getters: GetterTree<AppState, any> = {
    getCurrentView: state => state.currentView,
  };

  export const app = {
    state,
    getters,
  };