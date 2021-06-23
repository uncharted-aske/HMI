import { GetterTree, MutationTree, ActionTree } from 'vuex';

import * as Model from '@/types/typesModel';

import { fetchInitialModelData } from '@/static/mockedDataDemo';
import { emmaaModelList } from '@/services/EmmaaFetchService';

const state: Model.State = {
  isInitialized: false,
  selectedModelIds: new Set(),
  modelsList: [],
  selectedModelGraph: 0, // Refers to the position in the array of graphs for each modeling framework
};

const actions: ActionTree<Model.State, any> = {
  async setInitialModelsState ({ commit }) {
    // Initialize static models
    const initialModelsList = await fetchInitialModelData();
    commit('setModelsList', initialModelsList);

    // TO REMOVE FROM HERE: Initialize models from emmaa
    try {
      const modelList = await emmaaModelList();
      modelList.map(metadata => commit('addModel', {
        metadata,
        // graph: {
        //   abstract: _.pick(nestedSIRCAG, ['nodes', 'edges']),
        //   detailed: _.pick(nestedSIRGrFN, ['nodes', 'edges']),
        // },
        // subgraph: subgraphJSON,
      }));
    } catch (error) {
      console.warn('EMMAA API is not responding', error); // eslint-disable-line no-console
    }

    commit('setIsInitialized', true);
  },
};

const getters: GetterTree<Model.State, any> = {
  getIsInitialized: state => state.isInitialized,
  getSelectedModelIds: state => [...state.selectedModelIds],
  getModelsList: state => state.modelsList,

  getCountComputationalModels: (state: Model.State): number => {
    return state.modelsList.length;
  },

  // TO REMOVE FROM HERE
  getCountGraphsModels: (state: Model.State): number => {
    return state.modelsList.length;
  },

  getSelectedModelGraph: state => state.selectedModelGraph,
};

const mutations: MutationTree<Model.State> = {
  addModel (state, newModel) {
    const modelsListLength = state.modelsList.length;
    state.modelsList.push(Object.assign({ id: modelsListLength }, newModel));
  },
  setIsInitialized (state, newIsInitialized) {
    state.isInitialized = newIsInitialized;
  },
  setModelsList (state, newModelsList) {
    state.modelsList = newModelsList;
  },

  setSelectedModels (state, newSelectedModelId) {
    if (state.selectedModelIds.has(newSelectedModelId)) {
      state.selectedModelIds.delete(newSelectedModelId);
    } else {
      state.selectedModelIds.add(newSelectedModelId);
    }
    // Trigger change by providing new Set instance
    state.selectedModelIds = new Set(state.selectedModelIds);
  },

  clearSelectedModels (state) {
    state.selectedModelIds.clear();
  },

  setSelectedModelGraph (state, value: number) {
    if (state.selectedModelGraph === value) value = null;
    state.selectedModelGraph = value;
  },
};

export {
  state,
  getters,
  mutations,
  actions,
};
