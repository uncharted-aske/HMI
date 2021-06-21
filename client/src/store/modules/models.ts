import _ from 'lodash';
import { GetterTree, MutationTree, ActionTree } from 'vuex';

import { ModelsState, ModelInterface } from '@/types/types';

import { staticFileURLs } from '@/static/mockedDataUrl';
import { emmaaModelList } from '@/services/EmmaaFetchService';
import { getUtil } from '@/utils/FetchUtil';
import { GroMEt2Graph } from 'research/gromet/tools/parser/GroMEt2Graph';

const state: ModelsState = {
  isInitialized: false,
  selectedModelIds: new Set(),
  modelsList: [],
  selectedModelGraph: 0, // Refers to the position in the array of graphs for each modeling framework
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fetchInitialModelData = async () => {
  const [
    SIR_PN,
    SIR_FN,
  ] = await Promise.all(
    staticFileURLs.map(url => getUtil(url, {})),
  );

  return {
    SIR_PN,
    SIR_FN,
  };
};

const buildInitialModelsList = ({
  SIR_PN,
  SIR_FN,
}): ModelInterface[] => {
  return [
    {
      id: 0,
      name: SIR_PN.name,
      modelGraph: [
        {
          file: '',
          type: 'PetriNetClassic',
          metadata: _.pick(GroMEt2Graph.parseGromet(SIR_PN), ['metadata']),
          graph: _.pick(GroMEt2Graph.parseGromet(SIR_PN), ['nodes', 'edges']),
        },
        {
          file: '',
          type: 'FunctionNetwork',
          metadata: _.pick(GroMEt2Graph.parseGromet(SIR_FN), ['metadata']),
          graph: _.pick(GroMEt2Graph.parseGromet(SIR_FN), ['nodes', 'edges']),
        },
      ],
    },
  ];
};

const actions: ActionTree<ModelsState, any> = {
  async setInitialModelsState ({ commit }) {
    const {
      SIR_PN,
      SIR_FN,
    } = await fetchInitialModelData();

    // Initialize static models
    const initialModelsList = buildInitialModelsList({
      SIR_PN,
      SIR_FN,
    });
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
        type: 'biomechanism',
      }));
    } catch (error) {
      console.warn('EMMAA API is not responding', error); // eslint-disable-line no-console
    }

    commit('setIsInitialized', true);
  },
};

const getters: GetterTree<ModelsState, any> = {
  getIsInitialized: state => state.isInitialized,
  getSelectedModelIds: state => [...state.selectedModelIds],
  getModelsList: state => state.modelsList,

  getCountComputationalModels: (state: ModelsState): number => {
    return state.modelsList.length;
  },

  // TO REMOVE FROM HERE
  getCountGraphsModels: (state: ModelsState): number => {
    return 16;
    // return state.modelsList.filter(model => model.type === ModelInterfaceType.biomechanism).length;
  },

  getSelectedModelGraph: state => state.selectedModelGraph,
};

const mutations: MutationTree<ModelsState> = {
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

export const models = {
  state,
  getters,
  mutations,
  actions,
};
