import { GetterTree, MutationTree, ActionTree } from 'vuex';
import * as KnowledgeGraph from '@/types/typesKnowledgeGraph';
import { emmaaGraphList } from '@/services/EmmaaFetchService';

const state: KnowledgeGraph.State = {
  isInitialized: false,
  graphsList: [],
  selectedGraph: null,
  selectedGraphIds: new Set(),
};

const actions: ActionTree<KnowledgeGraph.State, any> = {
  async setInitialKnowledgeGraphState ({ commit }) {
    let listMetadata: KnowledgeGraph.Metadata[];

    try {
      listMetadata = await emmaaGraphList();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('EMMAA API is not responding', error);
    }

    if (listMetadata) {
      listMetadata.map(metadata => {
        const graph: KnowledgeGraph.Graph = { metadata };
        commit('addGraph', graph);
      });
      commit('setIsInitialized', true);
    }
  },
};

const getters: GetterTree<KnowledgeGraph.State, any> = {
  getKnowledgeGraphsList: state => state.graphsList,
  getSelectedKnowledgeGraph: state => state.selectedGraph,
  getSelectedKnowledgeGraphIds: state => state.selectedGraphIds,
  getCountKnowledgeGraphs: (state): number => state.graphsList.length,
};

const mutations: MutationTree<KnowledgeGraph.State> = {
  addKnowledgeGraph (state, graph: KnowledgeGraph.Graph) {
    const listLength = state.graphsList.length.toString();
    state.graphsList.push(Object.assign({ id: listLength }, graph));
  },

  setIsInitialized (state, isInitialized: boolean) {
    state.isInitialized = isInitialized;
  },

  setKnowledgeGraphsList (state, graphsList: KnowledgeGraph.Graph[]) {
    state.graphsList = graphsList;
  },

  setSelectedKnowledgeGraphs (state, selectedGraphId: string) {
    if (state.selectedGraphIds.has(selectedGraphId)) {
      state.selectedGraphIds.delete(selectedGraphId);
    } else {
      state.selectedGraphIds.add(selectedGraphId);
    }
    // Trigger change by providing new Set instance
    state.selectedGraphIds = new Set(state.selectedGraphIds);
  },

  setSelectedKnowledgeGraph (state, value: string) {
    if (state.selectedGraph === value) value = null;
    state.selectedGraph = value;
  },

  clearSelectedKnowledgeGraphs (state) {
    state.selectedGraphIds.clear();
  },
};

export {
  state,
  getters,
  mutations,
  actions,
};
