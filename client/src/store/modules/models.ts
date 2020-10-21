import _ from 'lodash';
import { GetterTree, MutationTree } from 'vuex';

import { ModelsState } from '../../types/types';

import CHIME from '../../assets/uncharted_chime.json';
import CHIMEGrFN from '../../assets/formatted-CHIME-SIR-GrFN-metadata.json';

import SIR from '../../assets/uncharted_sir.json';
import SIRGrFN from '../../assets/formatted-SIR-simple-GrFN-metadata.json';

import DoubleEpi from '../../assets/uncharted_double_epi.json';
import DoubleEpiGrFN from '../../assets/formatted-SARS-COV1-SEIRP-GrFN-metadata.json';

import Covid19 from  '../../assets/covid_w095_forceatlas2.json';

const CovidModelMetadata = {
  name:'Covid-19 Model',
  description:'Covid-19 knowledge network automatically assembled from the CORD-19 document corpus.',
  version:'N/A',
  source:'EMMAA',
  created: '2020-10-19',
  knowledge:'pubmed, biorxiv'
}

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
    {
      id: 4,
      metadata: CovidModelMetadata,
      graph: Covid19,
      type: 'biological',
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
