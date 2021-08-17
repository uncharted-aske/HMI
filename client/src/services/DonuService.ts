import { GroMEt2Graph } from 'research/gromet/tools/parser/GroMEt2Graph';
import * as MARM_MODEL_AGGREGATED from '@/static/gromets/emmaa_aggregated/marm_model_gromet_2021-06-28-17-07-14_graph_agg_rev_rategroups.json';

import * as Donu from '@/types/typesDonu';
import * as Model from '@/types/typesModel';
import { getUtil, postUtil, postUtilMem } from '@/utils/FetchUtil';

// HACK: REMOVE when Donu provides CHIME+
export const staticFileURLs = [
  `${window.location.origin}/gromets/CHIME+.json`,
];

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

  const response = await callDonuCache(request);
  if (response.status === Donu.ResponseStatus.success) {
    const models = response.result ?? [];
    return models;
  } else {
    console.error('[DONU Service] — queryDonuModels', response); // eslint-disable-line no-console
  }
};

// HACK: Remove when we fetch CHIME+ from DONU
// eslint-disable-next-line
export const buildStaticModelsList = ({ CHIMEPlus }: any, modelIndex: number): Model.Model[] => {
  // Parse GroMEt
  const CHIMEPlusPARSED = GroMEt2Graph.parseGromet(CHIMEPlus);

  // Build object to store in models store
  const { name } = CHIMEPlus;
  const metadata = { name, description: '' };
  const modelGraph = {
    donuType: Donu.Type.GROMET_PNC,
    model: null,
    type: CHIMEPlus.type,
    metadata: CHIMEPlus.metadata,
    graph: {
      nodes: CHIMEPlusPARSED.nodes,
      edges: CHIMEPlusPARSED.edges,
    },
    bgraph: {
      nodes: null,
      edges: null,
    },
  };

  const output = { id: modelIndex, metadata, name, modelGraph: [modelGraph] };
  return [output as any]; // Not ideal but I was getting typescript errors
};

// HACK: Remove when we fetch CHIME+ from DONU
export const fetchStaticModels = async (modelIndex: number): Promise<Model.Model[]> => {
  const [CHIMEPlus] = await Promise.all(
    staticFileURLs.map(url => getUtil(url)),
  );

  return buildStaticModelsList({ CHIMEPlus }, modelIndex);
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

    // HACK: Add CHIME+ PNC. This should be removed once CHIME+ is provided by donu
    const staticModels = await fetchStaticModels(output.length + 1);
    output.push(...staticModels);

    return output;
  } else {
    console.error('[DONU Service] — fetchDonuModels', response); // eslint-disable-line no-console
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
      return response?.result as Donu.ModelDefinition;
    } else {
      console.error('[DONU Service] — getModelInterface', response); // eslint-disable-line no-console
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
