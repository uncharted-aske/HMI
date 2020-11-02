import _ from 'lodash';
import { GetterTree, MutationTree } from 'vuex';

import { ModelsState } from '../../types/types';

import CHIME from '../../static/uncharted_chime.json';
import CHIMEGrFN from '../../static/formatted-CHIME-SIR-GrFN-metadata.json';

import SIR from '../../static/uncharted_sir.json';
import SIRGrFN from '../../static/formatted-SIR-simple-GrFN-metadata.json';

import DoubleEpi from '../../static/uncharted_double_epi.json';
import DoubleEpiGrFN from '../../static/formatted-SARS-COV1-SEIRP-GrFN-metadata.json';

const state: ModelsState = {
  selectedModelId: null,
  modelsList: [
    {
      id: 1,
      metadata: SIR.metadata,
      graph: {
        abstract: _.pick(SIR, ['nodes', 'edges', 'groups']),
        detailed: _.pick(SIRGrFN, ['nodes', 'edges', 'groups']),
      },
      type: 'computational',
    },
    {
      id: 2,
      metadata: CHIME.metadata,
      graph: {
        abstract: _.pick(CHIME, ['nodes', 'edges', 'groups']),
        detailed: _.pick(CHIMEGrFN, ['nodes', 'edges', 'groups']),
      },
      type: 'computational',
    },
    {
      id: 3,
      metadata: DoubleEpi.metadata,
      graph: {
        abstract: _.pick(DoubleEpi, ['nodes', 'edges', 'groups']),
        detailed: _.pick(DoubleEpiGrFN, ['nodes', 'edges', 'groups']),
      },
      type: 'computational',
    },
  ],
};

const getters: GetterTree<ModelsState, any> = {
  getSelectedModelId: state => state.selectedModelId,
  getModelsList: state => state.modelsList,
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
