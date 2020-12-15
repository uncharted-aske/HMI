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

import comparisonJSON from '@/static/comparison-SimpleSIR-CHIME.json';

const state: ModelsState = {
  selectedModelId: null,
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
      metadata: SIR.metadata,
      graph: {
        abstract: _.pick(nestedSIRCAG, ['nodes', 'edges']),
        detailed: _.pick(nestedSIRGrFN, ['nodes', 'edges']),
      },
      type: 'knowledge',
    },
  ],
};

const getters: GetterTree<ModelsState, any> = {
  getSelectedModelId: state => state.selectedModelId,
  getModelsList: state => {
    return state.modelsList;
  },
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
