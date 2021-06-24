// import _ from 'lodash';
// import { GetterTree, MutationTree, ActionTree } from 'vuex';

// import { ModelsState, ModelInterface, ModelInterfaceType } from '@/types/types';

// import { emmaaModelList } from '@/services/EmmaaFetchService';
// import { getUtil } from '@/utils/FetchUtil';
// import { fetchDonuModels } from '@/services/DonuService';

// const state: ModelsState = {
//   isInitialized: false,
//   selectedModelIds: new Set(),
//   parameters: {},
//   comparisonHighlights: {},
//   modelsList: [],
//   selectedGraph: null,
// };

// // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// const fetchInitialModelData = async () => {
//   const staticFileURLs = [
//     `${window.location.origin}/gromet/SimpleSIR_gromet_FunctionNetwork_graph_representation.json`,
//     `${window.location.origin}/gromet/SimpleSIR_metadata_gromet_PetriNetClassic_Graph_Representation.json`,
//     `${window.location.origin}/uncharted_chime.json`,
//     `${window.location.origin}/nested-CHIME-SIR-CAG.json`,
//     `${window.location.origin}/nested-CHIME-SIR-GrFN.json`,
//     `${window.location.origin}/uncharted_sir.json`,
//     `${window.location.origin}/nested-SIR-simple-CAG.json`,
//     `${window.location.origin}/nested-SIR-simple-GrFN.json`,
//     `${window.location.origin}/uncharted_double_epi.json`,
//     `${window.location.origin}/nested-SARS-COV1-SEIRP-CAG.json`,
//     `${window.location.origin}/nested-SARS-COV1-SEIRP-GrFN.json`,
//     `${window.location.origin}/comparison-SimpleSIR-CHIME.json`, // Overlapping nodes and edges for SIR and CHIME
//     `${window.location.origin}/OAP1-CHIME-paths.json`, // Overlapping nodes and edges for SIR and CHIME
//     `${window.location.origin}/OAP1-SIR-paths.json`, // Overlapping nodes and edges for SIR and CHIME
//     `${window.location.origin}/NOAP1-CHIME-paths.json`, // Overlapping nodes and edges for SIR and CHIME
//     `${window.location.origin}/NOAP2-CHIME-paths.json`, // Overlapping nodes and edges for SIR and CHIME
//     `${window.location.origin}/NOAP1-SIR-paths.json`, // Overlapping nodes and edges for SIR and CHIME
//     `${window.location.origin}/subgraph.json`, // Boutique subgraph for COVID-19 model.
//     `${window.location.origin}/xdd_parameters_table.json`, // Boutique subgraph for COVID-19 model.
//   ];

//   const [
//     SimpleSIRGrometGrFN,
//     SimpleSIRGrometPNC,
//     CHIME,
//     nestedCHIMECAG,
//     nestedCHIMEGrFN,
//     SIR,
//     nestedSIRCAG,
//     nestedSIRGrFN,
//     DoubleEpi,
//     nestedDoubleEpiCAG,
//     nestedDoubleEpiGrFN,
//     comparisonJSON,
//     OAP1CHIMEPaths,
//     OAP1SIRPaths,
//     NOAP1CHIMEPaths,
//     NOAP2CHIMEPaths,
//     NOAP1SIRPaths,
//     subgraphJSON,
//     paramsData,
//   ] = await Promise.all(
//     staticFileURLs.map(url => getUtil(url, {})),
//   );

//   return {
//     SimpleSIRGrometGrFN,
//     SimpleSIRGrometPNC,
//     CHIME,
//     nestedCHIMECAG,
//     nestedCHIMEGrFN,
//     SIR,
//     nestedSIRCAG,
//     nestedSIRGrFN,
//     DoubleEpi,
//     nestedDoubleEpiCAG,
//     nestedDoubleEpiGrFN,
//     comparisonJSON,
//     OAP1CHIMEPaths,
//     OAP1SIRPaths,
//     NOAP1CHIMEPaths,
//     NOAP2CHIMEPaths,
//     NOAP1SIRPaths,
//     subgraphJSON,
//     paramsData,
//   };
// };

// const buildInitialModelsList = ({
//   SimpleSIRGrometGrFN,
//   SimpleSIRGrometPNC,
//   SIR,
//   nestedSIRCAG,
//   nestedSIRGrFN,
//   comparisonJSON,
//   CHIME,
//   nestedCHIMECAG,
//   nestedCHIMEGrFN,
//   DoubleEpi,
//   nestedDoubleEpiCAG,
//   nestedDoubleEpiGrFN,
// }): ModelInterface[] => {
//   return [
//     {
//       id: 0,
//       metadata: SIR.metadata,
//       graph: {
//         abstract: _.pick(nestedSIRCAG, ['nodes', 'edges']),
//         detailed: _.pick(nestedSIRGrFN, ['nodes', 'edges']),
//       },
//       subgraph: _.pick(comparisonJSON.subgraphs[0], ['nodes', 'edges']),
//       type: ModelInterfaceType.computational,
//     },
//     {
//       id: 1,
//       metadata: CHIME.metadata,
//       graph: {
//         abstract: _.pick(nestedCHIMECAG, ['nodes', 'edges']),
//         detailed: _.pick(nestedCHIMEGrFN, ['nodes', 'edges']),
//       },
//       subgraph: _.pick(comparisonJSON.subgraphs[1], ['nodes', 'edges']),
//       type: ModelInterfaceType.computational,
//     },
//     {
//       id: 2,
//       metadata: DoubleEpi.metadata,
//       graph: {
//         abstract: _.pick(nestedDoubleEpiCAG, ['nodes', 'edges']),
//         detailed: _.pick(nestedDoubleEpiGrFN, ['nodes', 'edges']),
//       },
//       type: ModelInterfaceType.computational,
//     },
//     {
//       id: 3,
//       metadata: {
//         name: 'SimpleSIRGromet',
//       },
//       graph: {
//         abstract: _.pick(SimpleSIRGrometPNC, ['nodes', 'edges']),
//         detailed: _.pick(SimpleSIRGrometGrFN, ['nodes', 'edges']),
//       },
//       type: ModelInterfaceType.computational,
//     },
//   ];
// };

// // TODO: Define ComparisonHighlight type
// // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// const buildInitialComparisonHighlights = ({
//   OAP1CHIMEPaths,
//   OAP1SIRPaths,
//   NOAP1CHIMEPaths,
//   NOAP2CHIMEPaths,
//   NOAP1SIRPaths,
// }) => {
//   return {
//     9: {
//       1: OAP1SIRPaths,
//       2: OAP1CHIMEPaths,
//     },
//     10: {
//       1: NOAP1SIRPaths,
//       2: { nodes: [], edges: [] },
//     },
//     11: {
//       1: { nodes: [], edges: [] },
//       2: NOAP2CHIMEPaths,
//     },
//     12: {
//       1: { nodes: [], edges: [] },
//       2: NOAP1CHIMEPaths,
//     },
//   };
// };

// const actions: ActionTree<ModelsState, any> = {
//   async setInitialModelsState ({ commit }) {
//     const {
//       SimpleSIRGrometGrFN,
//       SimpleSIRGrometPNC,
//       CHIME,
//       nestedCHIMECAG,
//       nestedCHIMEGrFN,
//       SIR,
//       nestedSIRCAG,
//       nestedSIRGrFN,
//       DoubleEpi,
//       nestedDoubleEpiCAG,
//       nestedDoubleEpiGrFN,
//       comparisonJSON,
//       OAP1CHIMEPaths,
//       OAP1SIRPaths,
//       NOAP1CHIMEPaths,
//       NOAP2CHIMEPaths,
//       NOAP1SIRPaths,
//       subgraphJSON,
//       paramsData,
//     } = await fetchInitialModelData();

//     commit('setParameters', paramsData);

//     // Initialize static models
//     const initialModelsList = buildInitialModelsList({
//       SimpleSIRGrometGrFN,
//       SimpleSIRGrometPNC,
//       SIR,
//       nestedSIRCAG,
//       nestedSIRGrFN,
//       comparisonJSON,
//       CHIME,
//       nestedCHIMECAG,
//       nestedCHIMEGrFN,
//       DoubleEpi,
//       nestedDoubleEpiCAG,
//       nestedDoubleEpiGrFN,
//     });
//     commit('setModelsList', initialModelsList);

//     // Initialize models from emmaa
//     try {
//       const modelList = await emmaaModelList();
//       modelList.map(metadata => commit('addModel', {
//         metadata,
//         graph: {
//           abstract: _.pick(nestedSIRCAG, ['nodes', 'edges']),
//           detailed: _.pick(nestedSIRGrFN, ['nodes', 'edges']),
//         },
//         subgraph: subgraphJSON,
//         type: 'biomechanism',
//       }));
//     } catch (error) {
//       console.warn('EMMAA API is not responding', error); // eslint-disable-line no-console
//     }

//     const initialComparisonHighlights = buildInitialComparisonHighlights({
//       OAP1CHIMEPaths,
//       OAP1SIRPaths,
//       NOAP1CHIMEPaths,
//       NOAP2CHIMEPaths,
//       NOAP1SIRPaths,
//     });
//     commit('setComparisonHighlights', initialComparisonHighlights);

//     // Add DONU models
//     try {
//       const donuModels = await fetchDonuModels();
//       donuModels.forEach(model => commit('addModel', model));
//     } catch (error) {
//       console.warn('Donu API is not responding', error); // eslint-disable-line no-console
//     }

//     commit('setIsInitialized', true);
//   },
// };

// const getters: GetterTree<ModelsState, any> = {
//   getIsInitialized: state => state.isInitialized,
//   getSelectedModelIds: state => [...state.selectedModelIds],
//   getParameters: state => state.parameters,
//   getModelsList: state => state.modelsList,
//   getComparisonHighlights: state => state.comparisonHighlights,

//   getCountComputationalModels: function (state: ModelsState): number {
//     return state.modelsList.filter(model => model.type === ModelInterfaceType.computational).length;
//   },

//   getCountGraphsModels: function (state: ModelsState): number {
//     return state.modelsList.filter(model => model.type === ModelInterfaceType.biomechanism).length;
//   },

//   getSelectedGraph: state => state.selectedGraph,
// };

// const mutations: MutationTree<ModelsState> = {
//   addModel (state, newModel) {
//     const modelsListLength = state.modelsList.length;
//     state.modelsList.push(Object.assign({ id: modelsListLength }, newModel));
//   },
//   setIsInitialized (state, newIsInitialized) {
//     state.isInitialized = newIsInitialized;
//   },
//   setParameters (state, newParameters) {
//     state.parameters = newParameters;
//   },
//   setModelsList (state, newModelsList) {
//     state.modelsList = newModelsList;
//   },
//   setComparisonHighlights (state, newComparisonHighlights) {
//     state.comparisonHighlights = newComparisonHighlights;
//   },
//   setSelectedModels (state, newSelectedModelId) {
//     if (state.selectedModelIds.has(newSelectedModelId)) {
//       state.selectedModelIds.delete(newSelectedModelId);
//     } else {
//       state.selectedModelIds.add(newSelectedModelId);
//     }
//     // Trigger change by providing new Set instance
//     state.selectedModelIds = new Set(state.selectedModelIds);
//   },

//   clearSelectedModels (state) {
//     state.selectedModelIds.clear();
//   },

//   setSelectedGraph (state, value: number | string) {
//     if (state.selectedGraph === value) value = null;
//     state.selectedGraph = value;
//   },
// };

// export const models = {
//   state,
//   getters,
//   mutations,
//   actions,
// };
