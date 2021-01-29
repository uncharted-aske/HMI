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

import comparisonJSON from '@/static/comparison-SimpleSIR-CHIME_v2.json';
import subgraphJSON from '@/static/subgraph.json'; // Boutique subgraph for COVID-19 model.

const state: ModelsState = {
  selectedModelIds: new Set(),
  modelsList: [
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
      type: 'knowledge',
    },
  ],
};

const getters: GetterTree<ModelsState, any> = {
  getSelectedModelIds: state => [...state.selectedModelIds],
  getModelsList: state => {
    return state.modelsList;
  },
};

const mutations: MutationTree<ModelsState> = {
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
};
