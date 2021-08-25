import { GetterTree, MutationTree, ActionTree } from 'vuex';
import { fetchDonuModels } from '@/services/DonuService';
import * as Model from '@/types/typesModel';
import * as Graphs from '@/types/typesGraphs';

import MODEL_COMPARISON from '@/static/model_comparison.json';

const state: Model.State = {
  isInitialized: false,
  selectedModelIds: new Set(),
  modelsList: [],
  selectedModelGraphType: Model.GraphTypes.PetriNetClassic, // Petri Net Classic as default
  modelsLayout: Graphs.GraphLayoutInterfaceType.elk, // Layered as default
  selectedNodes: [],
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
  getModelComparisonMap: (): Model.ModelComparisonMap => MODEL_COMPARISON,
  getSharedNodes: (state, getters) => (modelId: number): Graphs.SubgraphInterface => {
    const modelGraphType = getters.getSelectedModelGraphType;
    const selectedModel = state.modelsList.find(model => model.id === modelId)?.name + modelGraphType;
    const comparedModels = state.modelsList
      .filter(model => model.id !== modelId && state.selectedModelIds.has(model.id))
      .map(model => model.name + modelGraphType);
    const comparisonMap = getters.getModelComparisonMap[selectedModel];
    const nodes: Set<string> = new Set();

    for (const compareTo in comparisonMap) {
      if (comparedModels.includes(compareTo)) {
        Object.keys(comparisonMap[compareTo]).forEach(nodeGrometId => {
          if (comparisonMap[compareTo][nodeGrometId].length) {
            nodes.add(nodeGrometId);
          }
        });
      }
    }
    return { nodes: [...nodes].map(node => ({ id: node })), edges: [] };
  },
  getSelectedNodesData: (state, getters) => {
    const modelGraphType = getters.getSelectedModelGraphType;
    return state.selectedNodes.map((selectedNode: Model.SelectedNode) => {
      return state.modelsList
        .find(model => model.id === selectedNode.model)?.modelGraph
        .find(model => model.type === modelGraphType);
    });
  },
  getSelectedNodes: (state, getters) => (modelId: number): Graphs.SubgraphInterface => {
    const modelGraphType = getters.getSelectedModelGraphType;
    const selectedModel = state.modelsList.find(model => model.id === modelId).name + modelGraphType;
    const nodes: Set<string> = new Set();

    state.selectedNodes.forEach(selectedNode => {
      const selectedNodeModel = state.modelsList.find(model => model.id === selectedNode.model).name + modelGraphType;
      if (selectedNodeModel === selectedModel) {
        nodes.add(selectedNode.node);
      } else {
        const comparisonMap = getters.getModelComparisonMap[selectedNodeModel]?.[selectedModel];
        const selectedNodeIdArray = comparisonMap?.[selectedNode.node];
        if (selectedNodeIdArray) {
          for (const selectedNodeId of selectedNodeIdArray) {
            nodes.add(selectedNodeId);
          }
        }
      }
    });
    return { nodes: [...nodes].map(node => ({ id: node })), edges: [] };
  },
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

  setSelectedNodes (state, selectedNodes: Model.SelectedNode[]) {
    state.selectedNodes = selectedNodes;
  },
};

export {
  state,
  getters,
  mutations,
  actions,
};
