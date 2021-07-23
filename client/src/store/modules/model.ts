import { GetterTree, MutationTree, ActionTree } from 'vuex';
import { fetchDonuModels } from '@/services/DonuService';
import * as Model from '@/types/typesModel';

const state: Model.State = {
  isInitialized: false,
  selectedModelIds: new Set(),
  modelsList: [],
  selectedModelGraphType: Model.GraphTypes.PetriNetClassic, // Petri Net Classic as default
};

const actions: ActionTree<Model.State, any> = {
  async setInitialModelsState ({ commit }) {
    commit('setModelsList', await fetchDonuModels());
    commit('setIsInitialized', true);
  },
};

const getters: GetterTree<Model.State, any> = {
  getModelsList: state => state.modelsList,
  getSelectedModelIds: state => [...state.selectedModelIds],
  getSelectedModelGraphType: state => state.selectedModelGraphType,
  getCountComputationalModels: (state): number => state.modelsList.length,
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

  setSelectedModelGraphType (state, value: Model.GraphTypes) {
    if (state.selectedModelGraphType === value) value = null;
    state.selectedModelGraphType = value;
  },
};

export {
  state,
  getters,
  mutations,
  actions,
};
