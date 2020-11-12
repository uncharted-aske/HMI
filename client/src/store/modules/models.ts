import _ from 'lodash';
import { GetterTree, MutationTree } from 'vuex';

import { ModelsState } from '../../types/types';

import CHIME from '../../static/uncharted_chime.json';
import nestedCHIMEGrFN from '../../static/nested-CHIME-SIR-model-GrFN.json';

import SIR from '../../static/uncharted_sir.json';
import nestedSIRGrFN from '../../static/nested-SIR-simple-GrFN.json';

import DoubleEpi from '../../static/uncharted_double_epi.json';
import nestedDoubleEpiGrFN from '../../static/nested-SARS-COV1-SEIRP-GrFN.json';

const state: ModelsState = {
  selectedModelId: null,
  modelsList: [
    {
      id: 1,
      metadata: SIR.metadata,
      graph: {
        abstract: _.pick(nestedSIRGrFN, ['nodes', 'edges']),
        detailed: _.pick(nestedSIRGrFN, ['nodes', 'edges']),
      },
      type: 'computational',
    },
    {
      id: 2,
      metadata: CHIME.metadata,
      graph: {
        abstract: _.pick(nestedCHIMEGrFN, ['nodes', 'edges']),
        detailed: _.pick(nestedCHIMEGrFN, ['nodes', 'edges']),
      },
      type: 'computational',
    },
    {
      id: 3,
      metadata: DoubleEpi.metadata,
      graph: {
        abstract: _.pick(nestedDoubleEpiGrFN, ['nodes', 'edges']),
        detailed: _.pick(nestedDoubleEpiGrFN, ['nodes', 'edges']),
      },
      type: 'computational',
    },
    {
      id: 4,
      metadata: SIR.metadata,
      graph: {
        abstract: _.pick(SIR, ['nodes', 'edges', 'groups']),
        detailed: _.pick(SIRGrFN, ['nodes', 'edges', 'groups']),
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
