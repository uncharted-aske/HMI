import { GetterTree, MutationTree } from 'vuex';
import { ModelsState } from '../../types/types';

import CHIMECAG from '../../assets/formatted-CHIME-SIR-CAG-metadata.json';


const state: ModelsState = {
   selectedModelId: 'test'
//    modelsList: [
//      { id: 1, metadata: CHIMECAG.metadata },
//      { id: 2, metadata: CHIMECAG.metadata },
//    ]
}

const getters: GetterTree<ModelsState, any> = {
    selectedModelId: state => state.selectedModelId
}

const mutations: MutationTree<ModelsState> = {
    setSelectedModel(state, newSelectedModelId) {
        state.selectedModelId = newSelectedModelId;
    }
}

export const models = {
    state,
    getters,
    mutations
}