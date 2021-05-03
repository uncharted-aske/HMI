import s3Client from '@/services/S3Service';
import { loadJSONLFile } from '@/utils/FileLoaderUtil';
import { DataFile } from '@dekkai/data-source';
import { GraferNodesData, GraferEdgesData, GraferLayerData } from '@uncharted.software/grafer';

import { Filters, Filter } from '@/types/typesLex';
import { Filtre, Filtres, FILTRES } from '@/types/typesFiltres';
import { GraphInterface } from '@/types/typesGraphs';
import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
import { isEmpty } from './FiltersUtil';
import { buildHighlightClusterLayer, buildHighlightNodeLayer } from './GraferUtil';
import { EdgeTypes } from '@/graphs/svg/encodings';

import * as FiltresUtil from '@/utils/FiltresUtil';

const deepCopy = (inObject, keyBlackList?: Array<any>): any => {
  let value, key;

  if (typeof inObject !== 'object' || inObject === null) {
    return inObject; // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  const isArray = Array.isArray(inObject);
  const outObject = isArray ? [] : {};

  for (key in inObject) {
    if (!isArray && keyBlackList?.includes(key)) {
      // Object property should not be deep copied
      continue;
    }

    value = inObject[key];
    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopy(value, keyBlackList);
  }

  return outObject;
};

// Get a subgraph result from a BGraph query.
function getSubGraphFromBGraphQuery (bgraphQuery): any {
  return deepCopy(bgraphQuery.run(), ['_in', '_out']);
}

// FIXME: Fix return type once bgraph library types are added
export const loadBGraphData = (): Promise<any[]> => {
  const output = [];

  const getSignedBGraphNodesUrl = s3Client.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET,
    Key: process.env.S3_BGRAPH_NODES_KEY,
  });
  // TODO: @dekkai/data-source is unable to properly stream in gzipped files so we
  // are using a workaround by fetching a blob until the following issue is fixed:
  // https://github.com/dekkai-data/data-source/issues/1
  output[0] = fetch(getSignedBGraphNodesUrl)
    .then(rawData => rawData.blob())
    .then(bgNodesBlob => DataFile.fromLocalSource(bgNodesBlob))
    .then(bgNodesData => loadJSONLFile(bgNodesData));

  const getSignedBGraphEdgesUrl = s3Client.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET,
    Key: process.env.S3_BGRAPH_EDGES_KEY,
  });
  // TODO: @dekkai/data-source is unable to properly stream in gzipped files so we
  // are using a workaround by fetching a blob until the following issue is fixed:
  // https://github.com/dekkai-data/data-source/issues/1
  output[1] = fetch(getSignedBGraphEdgesUrl)
    .then(rawData => rawData.blob())
    .then(bgEdgesBlob => DataFile.fromLocalSource(bgEdgesBlob))
    .then(bgEdgesData => loadJSONLFile(bgEdgesData));

  return Promise.all(output);
};

// Add filter terms here to change the order in which they are processed in bgraph
// e.g. QUERY_FIELDS_MAP.BIO_NODE_NAME.field: 1
const filterTermToPriorityRank = {

};

// Assume that bgraph instance passed in has already been initialized
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const executeBgraph = (bgraph: any, clause: Filter): any => {
  switch (clause.field) {
    case QUERY_FIELDS_MAP.BIO_NODE_NAME.field: {
      let names = clause.values as string[];
      // Filter matching case insensitive names
      names = names.map(name => name.toLowerCase());
      return bgraph.filter(document => {
        if (document._type === 'node') {
          const node = document;
          return names.some(name => name === node.name.toLowerCase());
        }
        // Document is not a node
        return false;
      });
    }
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED.field: {
      return bgraph.filter(node => node.grounded === Boolean(clause.values[0]));
    }
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED_ONTO.field: {
      return bgraph.filter(node => node.grounded_onto === Boolean(clause.values[0]));
    }
    case QUERY_FIELDS_MAP.BIO_NODE_IN_DEGREE.field: {
      return bgraph.filter(node => clause.values.some(value => node.in_degree === Number(value)));
    }
    case QUERY_FIELDS_MAP.BIO_NODE_OUT_DEGREE.field: {
      return bgraph.filter(node => clause.values.some(value => node.out_degree === Number(value)));
    }
    default: {
      return bgraph;
    }
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const filterToBgraph = (bgraph: any, filters: Filters): any => {
  if (bgraph && !isEmpty(filters)) {
    const { clauses } = filters;

    const mapped = clauses.map((clause, index) => {
      return { index, value: filterTermToPriorityRank[clause.field] ?? 0 };
    });

    const sortedClauses = mapped.map(v => clauses[v.index]);

    let bgraphQuery = bgraph.v();
    sortedClauses.map(clause => {
      bgraphQuery = executeBgraph(bgraphQuery, clause);
    });
    return deepCopy(bgraphQuery.run(), ['_in', '_out']);
  }
};

/** Filters a BGraph, and returns back the filtres with aggregates. */
export function getBGraphAggregatesFromFiltres (bgraph: any, filtres: Filtres, fields: string[]): Filtres {
  fields.forEach(field => {
    const bgraphResult = bgraph.v()
      .filter({ _type: FILTRES[field].graphType })
      .property(FILTRES[field].name)
      .run();

    let aggregates;
    switch (FILTRES[field].type) {
      case 'histogram':
        aggregates = FiltresUtil.bgraphResultsToHistogram(bgraphResult);
        break;
      default:
        aggregates = null;
    }

    const filtre: Filtre = Object.assign(filtres.get(field), { aggregates });
    filtres.set(field, filtre);
  });

  return filtres;
}

/** Filters a BGraph, and returns a subgraph. *//*
export function getSubgraphFromFiltres (bgraph: any, filtres: Filtres): any {
  let bgraphQuery = bgraph.v();

  filtres.forEach(filtre => {
    // TODO - Right now we only filtres belief scores, so this function is pretty sommaires
    if (filtre.field === FILTRES.BELIEF_SCORE.name) {
      bgraphQuery = bgraphQuery
        .filter({ _type: FILTRES.BELIEF_SCORE.graphType })
        .filter(node => Boolean(node[FILTRES.BELIEF_SCORE.name]));
    }
  });

  return getSubGraphFromBGraphQuery(bgraphQuery);
}
*/

// TODO: Specify queryResults type once bgraph has result types
export const formatBGraphOutputToGraferLayers = (
  queryResults: any[],
  graferNodesData: GraferNodesData,
  graferIntraEdgesData: GraferEdgesData,
  graferInterEdgesData: GraferEdgesData,
): GraferLayerData[] => {
  // Deep copy results to avoid mutating passed in data
  const queryResultsDeepCopy = deepCopy(queryResults);
  const graferNodesDataResults = [];
  const graferIntraEdgesDataResults = [];
  const graferInterEdgesDataResults = [];

  for (let i = 0; i < queryResultsDeepCopy.length; i++) {
    const result = queryResultsDeepCopy[i];
    if (result._type === 'node' && result.grafer_id != null) {
      // Set node color on query result
      graferNodesDataResults.push(graferNodesData[result.grafer_id]);
    } else if (result._type === 'edge' && result.intra_edge_id != null) {
      // Set intra edge color on query result
      graferIntraEdgesDataResults.push(graferIntraEdgesData[result.intra_edge_id]);
    } else if (result._type === 'edge' && result.inter_edge_id != null) {
      // Set inter edge color on query result
      graferInterEdgesDataResults.push(graferInterEdgesData[result.inter_edge_id]);
    }
  }

  const highlightClusterLayer = buildHighlightClusterLayer('Highlights - Clusters', graferIntraEdgesDataResults, []);
  const highlightNodeLayer = buildHighlightNodeLayer('Highlights - Nodes', graferNodesDataResults, graferInterEdgesDataResults);

  return [highlightClusterLayer, highlightNodeLayer];
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const formatBGraphOutputToLocalGraph = (data: any): GraphInterface => {
  const nodes = [];
  const edges = [];
  const dataDeepCopy = deepCopy(data);
  dataDeepCopy.forEach(d => {
    if (d._type === 'node') {
      d.label = d.name;
      delete d.name;
      nodes.push(d);
    } else {
      d.source = d.source_id;
      d.target = d.target_id;
      delete d.source_id;
      delete d.target_id;
      edges.push(d);
    }
  });
  return {
    nodes,
    edges,
  };
};
