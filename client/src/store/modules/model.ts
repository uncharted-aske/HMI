import { GetterTree, MutationTree, ActionTree } from 'vuex';
import * as Donu from '@/types/typesDonu';
import * as Model from '@/types/typesModel';
import { fetchInitialModelData } from '@/static/mockedDataDemo';

const state: Model.State = {
  isInitialized: false,
  selectedModelIds: new Set(),
  modelsList: [],
  selectedModelGraph: 0, // Refers to the position in the array of graphs for each modeling framework
};

const actions: ActionTree<Model.State, any> = {
  async setInitialModelsState ({ commit }) {
    const initialModelsList = await fetchInitialModelData();

    // filter out non-gromets
    const modelList = initialModelsList.map(model => {
      model.modelGraph = model.modelGraph.filter(graph => {
        return [Donu.Type.GROMET_PNC/*, Donu.Type.GROMET_FN */].includes(graph.donuType);
      });
      if (model.modelGraph.length > 0) return model;
    });

    commit('setModelsList', modelList);
    commit('setIsInitialized', true);
  },
};

const getters: GetterTree<Model.State, any> = {
  getModelsList: state => state.modelsList,
  getSelectedModelIds: state => [...state.selectedModelIds],
  getSelectedModelGraph: state => state.selectedModelGraph,
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
