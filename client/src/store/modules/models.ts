import _ from 'lodash';
import { GetterTree, MutationTree } from 'vuex';

import { ModelsState } from '../../types/types';

import CHIME from '../../static/uncharted_chime.json';
import CHIMEGrFN from '../../static/formatted-CHIME-SIR-GrFN-metadata.json';
import nestedCHIMEGrFN from '../../static/nested-CHIME-SIR-GrFN-metadata.json';

import SIR from '../../static/uncharted_sir.json';
import SIRGrFN from '../../static/formatted-SIR-simple-GrFN-metadata.json';
import nestedSIRGrFN from '../../static/nested-SIR-simple-GrFN.json';

import DoubleEpi from '../../static/uncharted_double_epi.json';
import DoubleEpiGrFN from '../../static/formatted-SARS-COV1-SEIRP-GrFN-metadata.json';
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
