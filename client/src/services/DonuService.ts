import { GroMEt2Graph } from 'research/gromet/tools/parser/GroMEt2Graph';

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

const callDonuCache = (request: Donu.Request): Promise<Donu.Response> => {
  try {
    return postUtilMem(process.env.DONU_ENDPOINT, request);
  } catch (error) {
    console.error('[DONU Service] — callDonu', error); // eslint-disable-line no-console
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
    console.error('[DONU Service] — fetchDonuModelSource', response);
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

  const response = await callDonu(request);
  if (response.status === Donu.ResponseStatus.success) {
    const models = response.result ?? [];
    return models;
  } else {
    console.error('[DONU Service] — queryDonuModels', response); // eslint-disable-line no-console
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
    });
    // 6. Group models by model name
    const output = new Array(1);
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

      if (name === 'SimpleSIR' || name === 'SimpleSIR_metadata') {
        output[0] = {
          id: 0,
          metadata,
          name: 'SimpleSIR',
          modelGraph: output[0]?.modelGraph ?? [],
        };
        output[0].modelGraph.push(modelGraph);
      } else {
        output.push({
          id: output.length,
          metadata,
          name,
          modelGraph: [modelGraph],
        });
      }
    });

    return output;
  } else {
    console.error('[DONU Service] — fetchDonuModels', response); // eslint-disable-line no-console
  }
};

/** Fetch the parameters of a model */
export const getModelParameters = async (model: Model.Model, selectedModelGraphType: Model.GraphTypes): Promise<Donu.ModelParameter[]> => {
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
      const result = response?.result as Donu.ModelDefinition;
      return result?.parameters ?? null;
    } else {
      console.error('[DONU Service] — getModelParameters', response); // eslint-disable-line no-console
    }
  } else {
    console.error('[DONU Service] — getModelParameters', `No ${selectedModelGraphType} Graph available in this model`); // eslint-disable-line no-console
  }
};

/** Fetch the state variable of a model */
export const getModelVariables = async (model: Model.Model, selectedModelGraphType: Model.GraphTypes): Promise<Donu.ModelVariable[]> => {
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
      const result = response?.result as Donu.ModelDefinition;
      return result?.measures ?? null;
    } else {
      console.error('[DONU Service] — getModelVariables', response); // eslint-disable-line no-console
    }
  } else {
    console.error('[DONU Service] — getModelParameters', `No ${selectedModelGraphType} Graph available in this model`); // eslint-disable-line no-console
  }
};

const getSimulationType = (modelType: Donu.Type): Donu.SimulationType | void => {
  if (modelType === Donu.Type.GROMET_PNC) {
    // HACK: Donu defaults to Algebraic Julia as the sim engine for Petri Net Classics.
    // here we've temporarily overwritten to use GSL as algebraic julia contains a bug
    return Donu.SimulationType.GSL;
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
      // HACK: get simulation type is a temporary solution while the Donu service fixes their simulation engine calls
      'sim-type': getSimulationType(modelGraph.donuType as Donu.Type),
      definition: {
        source: { model: modelGraph.model },
        type: modelGraph.donuType as Donu.Type,
      } as Donu.ModelDefinition,
      parameters: parameters,
      end: config.end,
      start: config.start,
      step: config.step,
    };

    const response = await callDonuCache(request);
    if (response.status === Donu.ResponseStatus.success) {
      return response?.result as Donu.SimulationResponse ?? null;
    } else {
      console.error('[DONU Service] — getModelResult', response); // eslint-disable-line no-console
    }
  } else {
    console.error('[DONU Service] — getModelResult', `No ${selectedModelGraphType} Graph available in this model`); // eslint-disable-line no-console
  }
};
