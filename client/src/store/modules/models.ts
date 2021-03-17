import _ from 'lodash';
import { GetterTree, MutationTree, ActionTree } from 'vuex';

import { ModelsState, ModelInterface } from '@/types/types';

import { emmaaModelList } from '@/services/EmmaaFetchService';
import { getUtil } from '@/utils/FetchUtil';

const state: ModelsState = {
  isInitialized: false,
  selectedModelIds: new Set(),
  parameters: {},
  comparisonHighlights: {},
  modelsList: [],
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fetchInitialModelData = async () => {
  const CHIME = await getUtil(`${window.location.protocol}//${window.location.host}/uncharted_chime.json`, {});
  const nestedCHIMECAG = await getUtil(`${window.location.protocol}//${window.location.host}/nested-CHIME-SIR-CAG.json`, {});
  const nestedCHIMEGrFN = await getUtil(`${window.location.protocol}//${window.location.host}/nested-CHIME-SIR-GrFN.json`, {});

  const SIR = await getUtil(`${window.location.protocol}//${window.location.host}/uncharted_sir.json`, {});
  const nestedSIRCAG = await getUtil(`${window.location.protocol}//${window.location.host}/nested-SIR-simple-CAG.json`, {});
  const nestedSIRGrFN = await getUtil(`${window.location.protocol}//${window.location.host}/nested-SIR-simple-GrFN.json`, {});

  const DoubleEpi = await getUtil(`${window.location.protocol}//${window.location.host}/uncharted_double_epi.json`, {});
  const nestedDoubleEpiCAG = await getUtil(`${window.location.protocol}//${window.location.host}/nested-SARS-COV1-SEIRP-CAG.json`, {});
  const nestedDoubleEpiGrFN = await getUtil(`${window.location.protocol}//${window.location.host}/nested-SARS-COV1-SEIRP-GrFN.json`, {});

  const comparisonJSON = await getUtil(`${window.location.protocol}//${window.location.host}/comparison-SimpleSIR-CHIME.json`, {}); // Overlapping nodes and edges for SIR and CHIME
  const OAP1CHIMEPaths = await getUtil(`${window.location.protocol}//${window.location.host}/OAP1-CHIME-paths.json`, {}); // Overlapping nodes and edges for SIR and CHIME
  const OAP1SIRPaths = await getUtil(`${window.location.protocol}//${window.location.host}/OAP1-SIR-paths.json`, {}); // Overlapping nodes and edges for SIR and CHIME
  const NOAP1CHIMEPaths = await getUtil(`${window.location.protocol}//${window.location.host}/NOAP1-CHIME-paths.json`, {}); // Overlapping nodes and edges for SIR and CHIME
  const NOAP2CHIMEPaths = await getUtil(`${window.location.protocol}//${window.location.host}/NOAP2-CHIME-paths.json`, {}); // Overlapping nodes and edges for SIR and CHIME
  const NOAP1SIRPaths = await getUtil(`${window.location.protocol}//${window.location.host}/NOAP1-SIR-paths.json`, {}); // Overlapping nodes and edges for SIR and CHIME
  const subgraphJSON = await getUtil(`${window.location.protocol}//${window.location.host}/subgraph.json`, {}); // Boutique subgraph for COVID-19 model.
  const paramsData = await getUtil(`${window.location.protocol}//${window.location.host}/xdd_parameters_table.json`, {}); // Boutique subgraph for COVID-19 model.

  return {
    CHIME,
    nestedCHIMECAG,
    nestedCHIMEGrFN,
    SIR,
    nestedSIRCAG,
    nestedSIRGrFN,
    DoubleEpi,
    nestedDoubleEpiCAG,
    nestedDoubleEpiGrFN,
    comparisonJSON,
    OAP1CHIMEPaths,
    OAP1SIRPaths,
    NOAP1CHIMEPaths,
    NOAP2CHIMEPaths,
    NOAP1SIRPaths,
    subgraphJSON,
    paramsData,
  };
};

const buildInitialModelsList = ({
  SIR,
  nestedSIRCAG,
  nestedSIRGrFN,
  comparisonJSON,
  CHIME,
  nestedCHIMECAG,
  nestedCHIMEGrFN,
  DoubleEpi,
  nestedDoubleEpiCAG,
  nestedDoubleEpiGrFN,
}): ModelInterface[] => {
  return [
    {
      id: 0,
      metadata: SIR.metadata,
      graph: {
        abstract: _.pick(nestedSIRCAG, ['nodes', 'edges']),
        detailed: _.pick(nestedSIRGrFN, ['nodes', 'edges']),
      },
      subgraph: _.pick(comparisonJSON.subgraphs[0], ['nodes', 'edges']),
      type: 'computational',
    },
    {
      id: 1,
      metadata: CHIME.metadata,
      graph: {
        abstract: _.pick(nestedCHIMECAG, ['nodes', 'edges']),
        detailed: _.pick(nestedCHIMEGrFN, ['nodes', 'edges']),
      },
      subgraph: _.pick(comparisonJSON.subgraphs[1], ['nodes', 'edges']),
      type: 'computational',
    },
    {
      id: 2,
      metadata: DoubleEpi.metadata,
      graph: {
        abstract: _.pick(nestedDoubleEpiCAG, ['nodes', 'edges']),
        detailed: _.pick(nestedDoubleEpiGrFN, ['nodes', 'edges']),
      },
      type: 'computational',
    },
  ];
};

// TODO: Define ComparisonHighlight type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const buildInitialComparisonHighlights = ({
  OAP1CHIMEPaths,
  OAP1SIRPaths,
  NOAP1CHIMEPaths,
  NOAP2CHIMEPaths,
  NOAP1SIRPaths,
}) => {
  return {
    9: {
      1: OAP1SIRPaths,
      2: OAP1CHIMEPaths,
    },
    10: {
      1: NOAP1SIRPaths,
      2: { nodes: [], edges: [] },
    },
    11: {
      1: { nodes: [], edges: [] },
      2: NOAP2CHIMEPaths,
    },
    12: {
      1: { nodes: [], edges: [] },
      2: NOAP1CHIMEPaths,
    },
  };
};

const actions: ActionTree<ModelsState, any> = {
  async setInitialModelsState ({ commit }) {
    const {
      CHIME,
      nestedCHIMECAG,
      nestedCHIMEGrFN,
      SIR,
      nestedSIRCAG,
      nestedSIRGrFN,
      DoubleEpi,
      nestedDoubleEpiCAG,
      nestedDoubleEpiGrFN,
      comparisonJSON,
      OAP1CHIMEPaths,
      OAP1SIRPaths,
      NOAP1CHIMEPaths,
      NOAP2CHIMEPaths,
      NOAP1SIRPaths,
      subgraphJSON,
      paramsData,
    } = await fetchInitialModelData();

    commit('setParameters', paramsData);

    // Initialize static models
    const initialModelsList = buildInitialModelsList({
      SIR,
      nestedSIRCAG,
      nestedSIRGrFN,
      comparisonJSON,
      CHIME,
      nestedCHIMECAG,
      nestedCHIMEGrFN,
      DoubleEpi,
      nestedDoubleEpiCAG,
      nestedDoubleEpiGrFN,
    });
    commit('setModelsList', initialModelsList);

    // Initialize models from emmaa
    const modelList = await emmaaModelList();
    modelList.map(metadata => commit('addModel', {
      metadata,
      graph: {
        abstract: _.pick(nestedSIRCAG, ['nodes', 'edges']),
        detailed: _.pick(nestedSIRGrFN, ['nodes', 'edges']),
      },
      subgraph: subgraphJSON,
      type: 'biomechanism',
    }));

    const initialComparisonHighlights = buildInitialComparisonHighlights({
      OAP1CHIMEPaths,
      OAP1SIRPaths,
      NOAP1CHIMEPaths,
      NOAP2CHIMEPaths,
      NOAP1SIRPaths,
    });
    commit('setComparisonHighlights', initialComparisonHighlights);

    commit('setIsInitialized', true);
  },
};

const getters: GetterTree<ModelsState, any> = {
  getIsInitialized: state => state.isInitialized,
  getSelectedModelIds: state => [...state.selectedModelIds],
  getParameters: state => state.parameters,
  getModelsList: state => state.modelsList,
  getComparisonHighlights: state => state.comparisonHighlights,
};

const mutations: MutationTree<ModelsState> = {
  addModel (state, newModel) {
    const modelsListLength = state.modelsList.length;
    state.modelsList.push(Object.assign({ id: modelsListLength }, newModel));
  },
  setIsInitialized (state, newIsInitialized) {
    state.isInitialized = newIsInitialized;
  },
  setParameters (state, newParameters) {
    state.parameters = newParameters;
  },
  setModelsList (state, newModelsList) {
    state.modelsList = newModelsList;
  },
  setComparisonHighlights (state, newComparisonHighlights) {
    state.comparisonHighlights = newComparisonHighlights;
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
};

export const models = {
  state,
  getters,
  mutations,
  actions,
};
