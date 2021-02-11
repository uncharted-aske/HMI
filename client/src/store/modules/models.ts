import _ from 'lodash';
import { GetterTree, MutationTree } from 'vuex';

import { ModelsState } from '@/types/types';
import { GraphEdgeInterface } from '@/views/Graphs/types/types';

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
import paramsData from '@/static/xdd_parameters_table.json'; // Boutique subgraph for COVID-19 model.

import covidDetailedNodes from '@/static/nodes.js';
import edgesBoutique from '@/static/edges_boutique.js';
import statementsBoutique from '@/static/statements_boutique.js';

const parseJSONL = (jsonlString: string, cb: (lineObj: Record<any, void>) => void): void => {
  const lines = jsonlString.split('\n');
  for (let line = 0; line < lines.length; line++) {
    try {
      cb(JSON.parse(lines[line]));
    } catch {

    }
  }
};

// Augment subgraph nodes with metadata

const subgraphJSONNodeIdMap = new Map();
subgraphJSON.nodes.map((node, index) => {
  subgraphJSONNodeIdMap.set(Number(node.id), index);
});
parseJSONL(covidDetailedNodes, node => {
  if (subgraphJSONNodeIdMap.has(node.id)) {
    // @ts-expect-error hack
    subgraphJSON.nodes[subgraphJSONNodeIdMap.get(node.id)].metadata = node;
  }
});

// Augment subgraph edges with metadata

const subgraphJSONEdgeIdMap = new Map();
subgraphJSON.edges.map((edge, index) => {
  subgraphJSONEdgeIdMap.set(Number(edge.id), index);
});

const statementBoutiqueMatchesHashMap = new Map();
parseJSONL(statementsBoutique, statement => {
  statementBoutiqueMatchesHashMap.set(statement.matches_hash, statement);
});

parseJSONL(edgesBoutique, edge => {
  if (subgraphJSONEdgeIdMap.has(edge.id)) {
    edge.statement = statementBoutiqueMatchesHashMap.get(edge.statement_id);
    const subgraphEdge: GraphEdgeInterface = subgraphJSON.edges[subgraphJSONEdgeIdMap.get(edge.id)];
    subgraphEdge.metadata = edge;
    subgraphEdge.metadata.source_label = subgraphJSON.nodes[subgraphJSONNodeIdMap.get(subgraphEdge.metadata.source_id)].label;
    subgraphEdge.metadata.target_label = subgraphJSON.nodes[subgraphJSONNodeIdMap.get(subgraphEdge.metadata.target_id)].label;
  }
});

// Models

const state: ModelsState = {
  selectedModelIds: new Set(),
  parameters: paramsData,
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
      metadata: { name: 'Acute Myeloid Leukemia', source: 'A model of molecular mechanisms governing AML, focusing on frequently mutated genes, and the pathways in which they are involved.' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 6,
      metadata: { name: 'Breast Cancer', source: 'A model of molecular mechanisms governing breast cancer, focusing on frequently mutated genes, and the pathways in which they are involved.' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 7,
      metadata: { name: 'Food Insecurity Model', source: 'A model of causal factors affecting food insecurity, built around a set of core concepts.' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 8,
      metadata: { name: 'Lung Adenocarcinoma', source: 'A model of molecular mechanisms governing lung cancer, focusing on frequently mutated genes, and the pathways in which they are involved.' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 9,
      metadata: { name: 'MARM Model', source: 'Natural-language-based implementation of the MARM model.' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 10,
      metadata: { name: 'Multiple sclerosis', source: 'A self-updating model of multiple sclerosis.' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 11,
      metadata: { name: 'Neurofibromatosis', source: 'Neurofibromatosis knowledge network automatically assembled from relevant publications in PubMed.' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 12,
      metadata: { name: 'Pancreatic Adenocarcinoma', source: 'A model of molecular mechanisms governing pancreatic cancer, focusing on frequently mutated genes, and the pathways in which they are involved.' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 13,
      metadata: { name: 'Pain Machine', source: 'A model of molecular mechanisms governing pain.' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 14,
      metadata: { name: 'Prostate Adenocarcinoma', source: 'A model of molecular mechanisms governing prostace cancer, focusing on frequently mutated genes, and the pathways in which they are involved.' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 15,
      metadata: { name: 'Ras Machine 2.0', source: 'A model of Ras signaling built using automated reading and assembly from the scientific literature.' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 16,
      metadata: { name: 'Ras Model', source: 'A human-curated model of Ras signaling defined in natural language.' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 17,
      metadata: { name: 'Melanoma', source: 'A model of molecular mechanisms governing melanoma, focusing on frequently mutated genes, and the pathways in which they are involved.' },
      graph: null,
      subgraph: subgraphJSON,
      type: 'causal',
    },
    {
      id: 18,
      metadata: { name: 'Vitiligo', source: 'A self-updating model of vitiligo.' },
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
