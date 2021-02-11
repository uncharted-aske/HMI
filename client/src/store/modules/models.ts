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

import comparisonJSON from '@/static/comparison-SimpleSIR-CHIME.json'; //Overlapping nodes and edges for SIR and CHIME
import OAP1Paths from '@/static/OAP1-paths.json'; //Overlapping nodes and edges for SIR and CHIME
import subgraphJSON from '@/static/subgraph.json'; // Boutique subgraph for COVID-19 model.
import paramsData from '@/static/xdd_parameters_table.json'; // Boutique subgraph for COVID-19 model.

const state: ModelsState = {
  selectedModelIds: new Set(),
  parameters: paramsData,
  comparisonHighlights: 
    {
      '9': OAP1Paths,
    }
  ,
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
      type: 'causal',
    },
    {
      id: 5,
      metadata: { name: 'Model N', description: 'Unknown' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 6,
      metadata: { name: 'Model N', description: 'Unknown' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 7,
      metadata: { name: 'Model N', description: 'Unknown' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 8,
      metadata: { name: 'Model N', description: 'Unknown' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 9,
      metadata: { name: 'Model N', description: 'Unknown' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 10,
      metadata: { name: 'Model N', description: 'Unknown' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 11,
      metadata: { name: 'Model N', description: 'Unknown' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 12,
      metadata: { name: 'Model N', description: 'Unknown' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 13,
      metadata: { name: 'Model N', description: 'Unknown' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 14,
      metadata: { name: 'Model N', description: 'Unknown' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 15,
      metadata: { name: 'Model N', description: 'Unknown' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
  ],
};

const getters: GetterTree<ModelsState, any> = {
  getSelectedModelIds: state => [...state.selectedModelIds],
  getParameters: state => state.parameters,
  getModelsList: state => state.modelsList,
  getComparisonHighlights: state => state.comparisonHighlights,
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
