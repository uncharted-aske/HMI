import { GroMEt2Graph } from 'research/gromet/tools/parser/GroMEt2Graph';
import * as MARM_MODEL_AGGREGATED from '@/static/gromets/emmaa_aggregated/marm_model_gromet_2021-06-28-17-07-14_graph_agg_rev_rategroups.json';

import * as Donu from '@/types/typesDonu';
import * as Model from '@/types/typesModel';
import { postUtil, postUtilMem } from '@/utils/FetchUtil';

/** Send the request to Donu */
const callDonu = (request: Donu.Request): Promise<Donu.Response> => {
  try {
    return postUtil(process.env.DONU_ENDPOINT, request);
  } catch (error) {
    console.error('[DONU Service] — callDonu', error); // eslint-disable-line no-console
  }
};

/** Send the request to Donu, via JS cache */
const callDonuCache = (request: Donu.Request): Promise<Donu.Response> => {
  try {
    return postUtilMem(process.env.DONU_ENDPOINT, request);
  } catch (error) {
    console.error('[DONU Service] — callDonuCache', error); // eslint-disable-line no-console
  }
};

const getDonuModelSource = async (model: string, type: Donu.Type): Promise<Donu.ModelGraph> => {
  const request: Donu.Request = {
    command: Donu.RequestCommand.GET_MODEL_SOURCE,
    definition: {
      type,
      source: {
        model,
      },
    },
  };
  const response = await callDonu(request);
  if (response.status === Donu.ResponseStatus.success) {
    const modelSource = response.result.source;
    return JSON.parse(modelSource);
  } else {
    // eslint-disable-next-line no-console
    console.error('[DONU Service] — fetchDonuModelSource', response.error);
  }
};

const convertGrometNodesDataToBGraphNodesData = (nodes: any[], edges: any[]): any[] => {
  const bgNodes = [];
  for (const node of nodes) {
    node._id = node.id;
    node._type = 'node';
    bgNodes.push(node);
  }
  for (const edge of edges) {
    edge._id = `${edge.source}->${edge.target}`;
    edge._type = 'edge';
    bgNodes.push(edge);
  }
  return bgNodes;
};

const convertGrometEdgesDataToBGraphEdgesData = (edges: any[]): any[] => {
  const bgEdges = [];
  for (const edge of edges) {
    const sourceEdge = {
      _id: `${edge.source}->${edge.source}->${edge.target}`,
      _out: edge.source,
      _in: `${edge.source}->${edge.target}`,
    };
    const targetEdge = {
      _id: `${edge.source}->${edge.target}->${edge.target}`,
      _out: `${edge.source}->${edge.target}`,
      _in: edge.target,
    };
    bgEdges.push(sourceEdge);
    bgEdges.push(targetEdge);
  }
  return bgEdges;
};

/** Query available models from Donu API */
export const queryDonuModels = async (text: string): Promise<any[]> => {
  const request: Donu.Request = {
    command: Donu.RequestCommand.QUERY_MODELS,
    text,
  };

  const response = await callDonuCache(request);
  if (response.status === Donu.ResponseStatus.success) {
    return response.result ?? [];
  } else {
    console.error('[DONU Service] — queryDonuModels', response.error); // eslint-disable-line no-console
  }
};

/** Fetch a complete list of available models from Donu API */
export const fetchDonuModels = async (): Promise<Model.Model[]> => {
  const request: Donu.Request = {
    command: Donu.RequestCommand.LIST_MODELS,
  };

  const response = await callDonu(request);
  if (response.status === Donu.ResponseStatus.success) {
    // 1. Get models
    let models = response?.result ?? null;

    // 2. Filter models to PNC and FN type
    models = models.filter(model => {
      return [Donu.Type.GROMET_PNC, Donu.Type.GROMET_FN].includes(model.type);
    });

    // 3. Populate models with model source
    await Promise.all(models.map(async model => {
      model.gromet = await getDonuModelSource(model.source.model, model.type);
    }));

    models.forEach(model => {
      // 4. Transform Gromet to graph for rendering
      model.graph = GroMEt2Graph.parseGromet(model.gromet);

      // 5. Transform Gromet to bgraph for querying
      model.bgNodes = convertGrometNodesDataToBGraphNodesData(model.graph.nodes, model.graph.edges);
      model.bgEdges = convertGrometEdgesDataToBGraphEdgesData(model.graph.edges);

      if (model.source.model === 'marm_model_gromet_2021-06-28-17-07-14.json' && model.type === Donu.Type.GROMET_PNC) {
        // HACK: Use aggregated marm model as visual graph
        model.graph = MARM_MODEL_AGGREGATED;
      }
    });

    // 6. Group models by model name
    const output = [];
    // Track seen model names to group models of different types but the same
    // name together
    // HACK: An assumption has been made that a model with the same name is
    // the same model. This is currently true however is not guaranteed
    const seenModelNames = new Map();
    models.forEach(model => {
      const { name } = model.gromet;
      const metadata = { name, description: '' };
      const modelGraph = {
        donuType: model.type,
        model: model.source.model,
        type: model.gromet.type,
        metadata: model.gromet.metadata,
        graph: {
          nodes: model.graph.nodes,
          edges: model.graph.edges,
        },
        bgraph: {
          nodes: model.bgNodes,
          edges: model.bgEdges,
        },
      };
      if (seenModelNames.has(name)) {
        const modelIndex = seenModelNames.get(name);
        output[modelIndex].modelGraph.push(modelGraph);
      } else {
        const index = output.length;
        output.push({
          id: index,
          metadata,
          name,
          modelGraph: [modelGraph],
        });
        seenModelNames.set(name, index);
      }
    });

    return output;
  } else {
    console.error('[DONU Service] — fetchDonuModels', response.error); // eslint-disable-line no-console
  }
};

/** Fetch the interface of a model */
export const getModelInterface = async (model: Model.Model, selectedModelGraphType: Model.GraphTypes): Promise<Donu.ModelDefinition> => {
  if (!model) return;
  const modelGraph = model.modelGraph.find(graph => graph.type === selectedModelGraphType);
  if (modelGraph) {
    const request: Donu.Request = {
      command: Donu.RequestCommand.DESCRIBE_MODEL_INTERFACE,
      definition: {
        source: { model: modelGraph.model },
        type: modelGraph.donuType as Donu.Type,
      } as Donu.ModelDefinition,
    };

    const response = await callDonuCache(request);
    if (response.status === Donu.ResponseStatus.success) {
      /** TODO
       * This is a temporary mock up for Demonstration purposes.
       * The DONU API needs to be clearer on which outputs can be selected programatically.
       * Also, the HMI needs to be updated to allow the user to select which paramaters
       * to use as `domain_parameter` for the simulation steps.
       */
      if (selectedModelGraphType === Model.GraphTypes.FunctionNetwork) {
        const result = response?.result as Donu.ModelDefinition;
        let domainParameter;
        if (modelGraph.model === 'SimpleSIR_metadata_gromet_FunctionNetwork.json') {
          domainParameter = 'P:sir.in.dt';
        } else if (modelGraph.model === 'CHIME_SIR_v01_gromet_FunctionNetwork_by_hand.json') {
          domainParameter = 'P:sir.n';
        } else if (modelGraph.model === 'CHIME_SIR_Base_variables_gromet_FunctionNetwork-with-metadata--GroMEt.json') {
          // TODO: Ensure with Donu team that this is the right domain parameter
          domainParameter = 'J:main.n_days';
        } else {
          // HACK: Fallback when we don't know the domain parameter we guess
          domainParameter = 'J:main.n_days';
        }

        result.parameters = result.parameters
          .map(parameter => {
            if (parameter.uid === domainParameter) {
              parameter.value_type = 'domain_parameter'; // Leveraging this unused property.
            }
            return parameter;
          });
        return result;
      }

      return response?.result as Donu.ModelDefinition;
    } else {
      console.error('[DONU Service] — getModelInterface', response.error); // eslint-disable-line no-console
    }
  } else {
    console.warn('[DONU Service] — getModelInterface', `No ${selectedModelGraphType} Graph available in this model`); // eslint-disable-line no-console
  }
};

/** Fetch the result of a model simulation */
export const getModelResult = async (
  model: Model.Model,
  parameters: Donu.RequestParameters,
  config: Donu.RequestConfig,
  selectedModelGraphType: Model.GraphTypes,
): Promise<Donu.SimulationResponse> => {
  const modelGraph = model.modelGraph.find(graph => graph.type === selectedModelGraphType);
  if (modelGraph) {
    const request: Donu.Request = {
      command: Donu.RequestCommand.SIMULATE,
      definition: {
        source: { model: modelGraph.model },
        type: modelGraph.donuType as Donu.Type,
      } as Donu.ModelDefinition,
      parameters: parameters,
      end: config.end,
      start: config.start,
      step: config.step,
    };

    /** TODO
     * This is a temporary mock up for Demonstration purposes.
     * The DONU API needs to be clearer on which outputs can be selected programatically.
     * Also, the HMI needs to be updated to allow the user to select which paramaters
     * to use as `domain_parameter` for the simulation steps.
     */
    if (selectedModelGraphType === Model.GraphTypes.FunctionNetwork) {
      if (modelGraph.model === 'SimpleSIR_metadata_gromet_FunctionNetwork.json') {
        // request.outputs = ['P:sir.out.S', 'P:sir.out.I', 'P:sir.out.R'];
        request.domain_parameter = 'P:sir.in.dt';
      } else if (modelGraph.model === 'CHIME_SIR_v01_gromet_FunctionNetwork_by_hand.json') {
        // request.outputs = ['P:sir.s_out', 'P:sir.i_out', 'P:sir.r_out'];
        request.domain_parameter = 'P:sir.n';
      } else if (modelGraph.model === 'CHIME_SIR_Base_variables_gromet_FunctionNetwork-with-metadata--GroMEt.json') {
        // TODO: Ensure with Donu team that this is the right domain parameter
        request.domain_parameter = 'J:main.n_days';
      } else {
        // HACK: Fallback when we don't know the domain parameter we guess
        console.warn('[DONU Service] — getModelResult', 'Using default domain parameter may not be correct.'); // eslint-disable-line no-console
        request.domain_parameter = 'J:main.n_days';
      }
    }

    const response = await callDonuCache(request);
    if (response.status === Donu.ResponseStatus.success) {
      return response?.result as Donu.SimulationResponse ?? null;
    } else {
      console.error('[DONU Service] — getModelResult', response.error); // eslint-disable-line no-console
    }
  } else {
    console.warn('[DONU Service] — getModelResult', `No ${selectedModelGraphType} Graph available in this model`); // eslint-disable-line no-console
  }
};

export const getSimulationError = async (
  measures: Donu.Measure[],
  interpolationModel: Donu.InterpolationModelTypes,
  errorModel: Donu.ErrorModelTypes,
): Promise<Donu.ComputeErrorResponse> => {
  const request: Donu.Request = {
    command: Donu.RequestCommand.COMPUTE_ERROR,
    'interp-model': interpolationModel,
    'error-model': errorModel,
    measures,
  };

  const response = await callDonuCache(request);
  if (response.status === Donu.ResponseStatus.success) {
    return response.result as unknown as Donu.ComputeErrorResponse;
  } else {
    console.error('[DONU Service] — getSimulationError', response); // eslint-disable-line no-console
  }
};

// List Dataset Response output
// [{
//   source: {
//     model: {
//       'JHU-Infections-TN.json', // Data file name is used as an identifier to retrieve dataset
//     },
//   },
//   name: 'JHU Infection Data',
//   description: 'Infection data for TN',
// }]
/** Fetch the result of a model simulation */
export const listDatasetsResult = async (): Promise<Donu.ListDatasetsResponse[]> => {
  const request: Donu.Request = {
    command: Donu.RequestCommand.LIST_DATASETS,
  };

  const response = await callDonuCache(request);
  if (response.status === Donu.ResponseStatus.success) {
    return response.result as Donu.ListDatasetsResponse[];
  } else {
    console.error('[DONU Service] — listDatasetsResult', response); // eslint-disable-line no-console
  }
};

// Get Dataset Response output
// {
//   name: "GDA Infection Data",
//   description: "Infection data for FL",
//   columns: [
//     {
//       values: [0, 1, 2, 3, ...],
//       name: 'date',
//       description: 'date',
//     },
//     {
//       values: [129, 32, 0, 213, ...],
//       name: 'daily_cases',
//       description: 'daily_cases',
//     }
//   ]
// }
export const getDatasetResult = async (model: string): Promise<Donu.GetDatasetResponse> => {
  const request: Donu.Request = {
    command: Donu.RequestCommand.GET_DATASET,
    source: {
      model,
    },
  };

  const response = await callDonuCache(request);
  if (response.status === Donu.ResponseStatus.success) {
    return response.result as Donu.GetDatasetResponse;
  } else {
    console.error('[DONU Service] — getDatasetResult', response); // eslint-disable-line no-console
  }
};

// Get Dataset Response output
// {
//   name: "GDA Infection Data",
//   description: "Infection data for FL",
//   columns: [
//     {
//       values: [0, 1, 2, 3, ...],
//       name: 'date',
//       description: 'date',
//     },
//     {
//       values: [129, 32, 0, 213, ...],
//       name: 'daily_cases',
//       description: 'daily_cases',
//     }
//   ]
// }
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const fitMeasures = async (data: any, parameters: string[], source: string, type: Donu.Type): Promise<Donu.FitMeasuresResponse> => {
  const request: Donu.Request = {
    command: Donu.RequestCommand.FIT_MEASURES,
    definition: {
      type,
      source: {
        model: source,
      },
    },
    parameters,
    data,
  };

  const response = await callDonuCache(request);
  if (response.status === Donu.ResponseStatus.success) {
    return response.result as Donu.FitMeasuresResponse;
  } else {
    console.error('[DONU Service] — fitMeasures', response); // eslint-disable-line no-console
  }
};
