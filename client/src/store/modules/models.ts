import { GetterTree, MutationTree } from 'vuex';
import { ModelsState } from '../../types/types';

import CHIME from '../../assets/uncharted_chime.json';

import SIR from '../../assets/uncharted_sir.json';

const state: ModelsState = {
  selectedModelId: null,
  modelsList: [
    {
      id: 1,
      metadata: CHIME.metadata,
      graph: {
        abstract: { nodes: CHIME.nodes, edges: CHIME.edges, groups: CHIME.groups }, 
        detailed: null
      },
      type: 'computational',
    },
    {
      id: 2,
      metadata: SIR.metadata,
      graph: {
        abstract:  { nodes: SIR.nodes, edges: SIR.edges, groups: SIR.groups }, 
        detailed: null
      },
      type: 'computational',
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
