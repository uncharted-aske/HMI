import { GetterTree, MutationTree, ActionTree } from 'vuex';
import { fetchDonuModels } from '@/services/DonuService';
import * as Model from '@/types/typesModel';
import * as Graphs from '@/types/typesGraphs';

const state: Model.State = {
  isInitialized: false,
  selectedModelIds: new Set(),
  modelsList: [],
  selectedModelGraphType: Model.GraphTypes.PetriNetClassic, // Petri Net Classic as default
  modelsLayout: Graphs.GraphLayoutInterfaceType.elk, // Layered as default
};

const actions: ActionTree<Model.State, any> = {
  async setInitialModelsState ({ commit }) {
    commit('setModelsList', await fetchDonuModels());
    commit('setIsInitialized', true);
  },

  resetSelectedModelIds ({ commit }) {
    commit('resetSelectedModelIds');
  },
};

const getters: GetterTree<Model.State, any> = {
  getModelsList: state => state.modelsList,
  getSelectedModelIds: state => [...state.selectedModelIds],
  getSelectedModelGraphType: (state, getters) => {
    if (state.selectedModelIds.size === 1) {
      const modelGraphTypeList = state.modelsList
        .find(model => model.id === getters.getSelectedModelIds[0])?.modelGraph
        .map(modelGraph => modelGraph.type);
      if (modelGraphTypeList?.length && !modelGraphTypeList.includes(state.selectedModelGraphType)) {
        return modelGraphTypeList[0];
      }
    }
    return state.selectedModelGraphType;
  },
  getCountComputationalModels: (state): number => state.modelsList.length,
  getModelsLayout: state => state.modelsLayout,
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

  setModelsLayout (state, newModelsLayout) {
    state.modelsLayout = newModelsLayout;
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

  resetSelectedModelIds (state: Model.State) {
    state.selectedModelIds = new Set();
  },
};

export {
  state,
  getters,
  mutations,
  actions,
};
