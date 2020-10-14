import { GetterTree, MutationTree } from 'vuex';
import { ModelsState } from '../../types/types';

import CHIME from '../../assets/uncharted_chime.json';

const state: ModelsState = {
  selectedModelId: null,
  modelsList: [
    { id: 1, 
      metadata: CHIME.metadata, 
      graph: { nodes: CHIME.nodes, edges: CHIME.edges, groups: CHIME.groups}, 
      type: 'computational' 
    },
  ],
};

const getters: GetterTree<ModelsState, any> = {
  getSelectedModelId: state => state.selectedModelId,
  getModelsList: state => state.modelsList,
};

const mutations: MutationTree<ModelsState> = {
  setSelectedModel (state, newSelectedModelId) {
    state.selectedModelId = newSelectedModelId;
  },
};

export const models = {
  state,
  getters,
  mutations,
};
