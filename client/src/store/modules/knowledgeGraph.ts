import { GetterTree, MutationTree, ActionTree } from 'vuex';
import * as KnowledgeGraph from '@/types/typesKnowledgeGraph';
import { emmaaModelList } from '@/services/EmmaaFetchService';

const state: KnowledgeGraph.State = {
  isInitialized: false,
  graphsList: [],
  selectedGraph: null,
  selectedGraphIds: new Set(),
};

const actions: ActionTree<KnowledgeGraph.State, any> = {
  async setInitialState ({ commit }) {
    let list: KnowledgeGraph.Graph[];

    try {
      list = await emmaaModelList();
    } catch (error) {
      console.warn('EMMAA API is not responding', error); // eslint-disable-line no-console
    }

    if (list) {
      list.map(metadata => commit('addGraph', {
        metadata,
        // graph: {
        //   abstract: _.pick(nestedSIRCAG, ['nodes', 'edges']),
        //   detailed: _.pick(nestedSIRGrFN, ['nodes', 'edges']),
        // },
        // subgraph: subgraphJSON,
      }));
      commit('setIsInitialized', true);
    }
  },
};

const getters: GetterTree<KnowledgeGraph.State, any> = {
  getGraphsList: state => state.graphsList,
  getSelectedGraph: state => state.selectedGraph,
  getSelectedGraphIds: state => state.selectedGraphIds,
  getCountGraphs: (state): number => state.graphsList.length,
};

const mutations: MutationTree<KnowledgeGraph.State> = {
  addGraph (state, graph: KnowledgeGraph.Graph) {
    const listLength = state.graphsList.length.toString();
    state.graphsList.push(Object.assign({ id: listLength }, graph));
  },

  setIsInitialized (state, isInitialized: boolean) {
    state.isInitialized = isInitialized;
  },

  setGraphsList (state, graphsList: KnowledgeGraph.Graph[]) {
    state.graphsList = graphsList;
  },

  setSelectedGraphs (state, selectedGraphId: string) {
    if (state.selectedGraphIds.has(selectedGraphId)) {
      state.selectedGraphIds.delete(selectedGraphId);
    } else {
      state.selectedGraphIds.add(selectedGraphId);
    }
    // Trigger change by providing new Set instance
    state.selectedGraphIds = new Set(state.selectedGraphIds);
  },

  setSelectedGraph (state, value: string) {
    if (state.selectedGraph === value) value = null;
    state.selectedGraph = value;
  },

  clearSelectedGraphs (state) {
    state.selectedGraphIds.clear();
  },
};

export {
  state,
  getters,
  mutations,
  actions,
};
