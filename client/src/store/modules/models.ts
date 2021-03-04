import _ from 'lodash';
import { GetterTree, MutationTree } from 'vuex';

import { ModelsState } from '@/types/types';

import CHIME from '@/static/uncharted_chime.json';
import nestedCHIMECAG from '@/static/nested-CHIME-SIR-CAG.json';
import nestedCHIMEGrFN from '@/static/nested-CHIME-SIR-GrFN.json';

import SIR from '@/static/uncharted_sir.json';
import nestedSIRCAG from '@/static/nested-SIR-simple-CAG.json';
import nestedSIRGrFN from '@/static/nested-SIR-simple-GrFN.json';

import DoubleEpi from '@/static/uncharted_double_epi.json';
import nestedDoubleEpiCAG from '@/static/nested-SARS-COV1-SEIRP-CAG.json';
import nestedDoubleEpiGrFN from '@/static/nested-SARS-COV1-SEIRP-GrFN.json';

import comparisonJSON from '@/static/comparison-SimpleSIR-CHIME.json'; // Overlapping nodes and edges for SIR and CHIME
import OAP1CHIMEPaths from '@/static/OAP1-CHIME-paths.json'; // Overlapping nodes and edges for SIR and CHIME
import OAP1SIRPaths from '@/static/OAP1-SIR-paths.json'; // Overlapping nodes and edges for SIR and CHIME
import NOAP1CHIMEPaths from '@/static/NOAP1-CHIME-paths.json'; // Overlapping nodes and edges for SIR and CHIME
import NOAP2CHIMEPaths from '@/static/NOAP2-CHIME-paths.json'; // Overlapping nodes and edges for SIR and CHIME
import NOAP1SIRPaths from '@/static/NOAP1-SIR-paths.json'; // Overlapping nodes and edges for SIR and CHIME
import subgraphJSON from '@/static/subgraph.json'; // Boutique subgraph for COVID-19 model.
import paramsData from '@/static/xdd_parameters_table.json'; // Boutique subgraph for COVID-19 model.

import { emmaaModelList } from '@/services/EmmaaFetchService';

const STATIC_MODELS = [
  {
    id: 1,
    metadata: SIR.metadata,
    graph: {
      abstract: _.pick(nestedSIRCAG, ['nodes', 'edges']),
      detailed: _.pick(nestedSIRGrFN, ['nodes', 'edges']),
    },
    subgraph: _.pick(comparisonJSON.subgraphs[0], ['nodes', 'edges']),
    type: 'computational',
  },
  {
    id: 2,
    metadata: CHIME.metadata,
    graph: {
      abstract: _.pick(nestedCHIMECAG, ['nodes', 'edges']),
      detailed: _.pick(nestedCHIMEGrFN, ['nodes', 'edges']),
    },
    subgraph: _.pick(comparisonJSON.subgraphs[1], ['nodes', 'edges']),
    type: 'computational',
  },
  {
    id: 3,
    metadata: DoubleEpi.metadata,
    graph: {
      abstract: _.pick(nestedDoubleEpiCAG, ['nodes', 'edges']),
      detailed: _.pick(nestedDoubleEpiGrFN, ['nodes', 'edges']),
    },
    type: 'computational',
  },
  {
    id: 4,
    metadata: { name: 'COVID-19 model', source: 'EMMAA', version: '', knowledge: 'https://emmaa.indra.bio/dashboard/covid19?tab=model', created: '', description: 'Covid-19 knowledge network automatically assembled from the CORD-19 document corpus.' },
    graph: {
      abstract: _.pick(nestedSIRCAG, ['nodes', 'edges']),
      detailed: _.pick(nestedSIRGrFN, ['nodes', 'edges']),
    },
    subgraph: subgraphJSON,
    type: 'causal',
  },
];

const state: ModelsState = {
  selectedModelIds: new Set(),
  parameters: paramsData,
  comparisonHighlights:
    {
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
    },
  modelsList: [
    ...STATIC_MODELS,
  ],
};

const getters: GetterTree<ModelsState, any> = {
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

const init = async (): Promise<void> => {
  const modelList = await emmaaModelList();
  modelList.map(metadata => mutations.addModel(state, {
    metadata,
    graph: null,
    subgraph: subgraphJSON,
    type: 'causal',
  }));
};

init();

export const models = {
  state,
  getters,
  mutations,
};
