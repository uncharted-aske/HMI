import { GetterTree, MutationTree } from 'vuex';
import { ModelsState } from '../../types/types';

import CHIME from '../../assets/uncharted_chime.json';

const state: ModelsState = {
  selectedModelId: null,
  modelsList: [
    { id: 1, metadata: CHIME.metadata, type: 'computational' },
    { id: 2, metadata: CHIME.metadata, type: 'computational' },
  ],
};

const getters: GetterTree<ModelsState, any> = {
  getModelsList: state => state.modelsList,
  // selectedModelMetadata: state => state.modelsList.find( model => model.id as selectedModelId)
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
