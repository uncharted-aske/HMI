import _ from 'lodash';

import { getS3Util } from '@/utils/FetchUtil';
import { loadJSONLFile } from '@/utils/FileLoaderUtil';
import { GraferLayerData } from '@uncharted.software/grafer';

import { Filters, Filter } from '@/types/typesLex';
import { Filtre, FiltreAggregate, Filtres, FILTRES } from '@/types/typesFiltres';
import { GraphInterface } from '@/types/typesGraphs';
import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
import { isEmpty } from './FiltersUtil';
import { buildHighlightClusterLayer, buildHighlightNodeLayer } from './GraferUtil';
import * as FiltresUtil from '@/utils/FiltresUtil';
import { BIO_EDGE_TYPE_OPTIONS } from '@/utils/ModelTypeUtil';

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
// function getSubGraphFromBGraphQuery (bgraphQuery): any {
//   return deepCopy(bgraphQuery.run(), ['_in', '_out']);
// }

// FIXME: Fix return type once bgraph library types are added
export const loadBGraphData = (nodesPath: string, edgesPath: string): Promise<any[]> => {
  const output = [
    getS3Util(nodesPath).then(bgNodesData => loadJSONLFile(bgNodesData)),
    getS3Util(edgesPath).then(bgNodesData => loadJSONLFile(bgNodesData)),
  ];

  return Promise.all(output);
};

// Add filter terms here to change the order in which they are processed in bgraph
const NODE_PRIORITY_RANK = 1;
const EDGE_PRIORITY_RANK = 4;
const filterTermToPriorityRank = {
  // Node Terms
  [QUERY_FIELDS_MAP.BIO_NODE_PRE.field]: 0,
  [QUERY_FIELDS_MAP.BIO_NODE_NAME.field]: NODE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_NODE_GROUP.field]: NODE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_NODE_GROUNDED.field]: NODE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_NODE_GROUNDED_ONTO.field]: NODE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_NODE_IN_DEGREE.field]: NODE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_NODE_OUT_DEGREE.field]: NODE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_NODE_POST.field]: 2,
  // Edge Terms
  [QUERY_FIELDS_MAP.BIO_EDGE_PRE.field]: 3,
  [QUERY_FIELDS_MAP.BIO_EDGE_TESTED.field]: EDGE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_EDGE_TYPE.field]: EDGE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_EDGE_DOI.field]: EDGE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_EDGE_POST.field]: 5,
};

// Assume that bgraph instance passed in has already been initialized
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const executeBgraphEdges = (bgraphEdgeQuery: any, clause: Filter): any => {
  switch (clause.field) {
    // EDGE CLAUSES
    case QUERY_FIELDS_MAP.BIO_EDGE_PRE.field: {
      return bgraphEdgeQuery;
    }
    case QUERY_FIELDS_MAP.BIO_EDGE_TESTED.field: {
      return bgraphEdgeQuery.filter(document => {
        if (document._type === 'edge') {
          const edge = document;
          return edge.tested === Boolean(clause.values[0]);
        }
        // Document is not an edge
        return false;
      });
    }
    case QUERY_FIELDS_MAP.BIO_EDGE_TYPE.field: {
      return bgraphEdgeQuery.filter(document => {
        if (document._type === 'edge') {
          const edge = document;
          return clause.values.some(typeIdx => BIO_EDGE_TYPE_OPTIONS[typeIdx] === edge.statement_type);
        }
        // Document is not an edge
        return false;
      });
    }
    case QUERY_FIELDS_MAP.BIO_EDGE_DOI.field: {
      let dois = clause.values as string[];
      dois = dois.map(doi => doi.toLowerCase());
      return bgraphEdgeQuery.filter(document => {
        if (document._type === 'edge') {
          const edge = document;
          return dois.some(doi => Object.keys(edge.doi_map).some(edgeDoi => {
            return edgeDoi.toLowerCase().includes(doi);
          }));
        }
        // Document is not an edge
        return false;
      });
    }
    case QUERY_FIELDS_MAP.BIO_EDGE_POST.field: {
      return bgraphEdgeQuery.as('edgeOnly').out().as('target').back('edgeOnly').in().as('source').merge('edgeOnly', 'source', 'target');
    }
    default: {
      return bgraphEdgeQuery;
    }
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const executeBgraphNodes = (bgraphNodeQuery: any, clause: Filter): any => {
  switch (clause.field) {
    // NODE CLAUSES
    case QUERY_FIELDS_MAP.BIO_NODE_PRE.field: {
      return bgraphNodeQuery;
    }
    case QUERY_FIELDS_MAP.BIO_NODE_NAME.field: {
      let names = clause.values as string[];
      // Filter matching case insensitive names
      names = names.map(name => name.toLowerCase());
      return bgraphNodeQuery.filter(document => {
        if (document._type === 'node') {
          const node = document;
          return names.some(name => name === node.name.toLowerCase());
        }
        // Document is not a node
        return false;
      });
    }
    case QUERY_FIELDS_MAP.BIO_NODE_GROUP.field: {
      return bgraphNodeQuery.filter(document => {
        if (document._type === 'node') {
          const node = document;
          return clause.values.some(group => node.group_map[group] !== undefined);
        }
        // Document type is an edge
        return false;
      });
    }
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED.field: {
      return bgraphNodeQuery.filter(document => {
        if (document._type === 'node') {
          const node = document;
          return node.grounded_db === Boolean(clause.values[0]);
        }
        // Document type is an edge
        return false;
      });
    }
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED_ONTO.field: {
      return bgraphNodeQuery.filter(document => {
        if (document._type === 'node') {
          const node = document;
          return node.grounded_group === Boolean(clause.values[0]);
        }
        // Document type is an edge
        return false;
      });
    }
    case QUERY_FIELDS_MAP.BIO_NODE_IN_DEGREE.field: {
      return bgraphNodeQuery.filter(document => {
        if (document._type === 'node') {
          const node = document;
          return clause.values.some(value => node.in_degree === Number(value));
        }
        // Document type is an edge
        return false;
      });
    }
    case QUERY_FIELDS_MAP.BIO_NODE_OUT_DEGREE.field: {
      return bgraphNodeQuery.filter(document => {
        if (document._type === 'node') {
          const node = document;
          return clause.values.some(value => node.out_degree === Number(value));
        }
        // Document type is an edge
        return false;
      });
    }
    case QUERY_FIELDS_MAP.BIO_NODE_POST.field: {
      return bgraphNodeQuery;
    }
    default: {
      return bgraphNodeQuery;
    }
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const filterToBgraph = (bgraph: any, filters: Filters): any => {
  if (bgraph && !isEmpty(filters)) {
    const clauses = deepCopy(filters.clauses);

    const hasNodeFilters = clauses.some(clause => filterTermToPriorityRank[clause.field] === NODE_PRIORITY_RANK);
    if (hasNodeFilters) {
      clauses.push(QUERY_FIELDS_MAP.BIO_NODE_PRE as unknown as Filter);
      clauses.push(QUERY_FIELDS_MAP.BIO_NODE_POST as unknown as Filter);
    }
    const hasEdgeFilters = clauses.some(clause => filterTermToPriorityRank[clause.field] === EDGE_PRIORITY_RANK);
    if (hasEdgeFilters) {
      clauses.push(QUERY_FIELDS_MAP.BIO_EDGE_PRE as unknown as Filter);
      clauses.push(QUERY_FIELDS_MAP.BIO_EDGE_POST as unknown as Filter);
    }

    const sortedClauses = clauses.sort((clause1, clause2) =>
      filterTermToPriorityRank[clause1.field] - filterTermToPriorityRank[clause2.field]);

    let bgraphEdgeQuery = bgraph.v();
    let bgraphNodeQuery = bgraph.v();
    if (hasNodeFilters) {
      sortedClauses.map(clause => {
        bgraphNodeQuery = executeBgraphNodes(bgraphNodeQuery, clause);
      });
    }
    if (hasEdgeFilters) {
      sortedClauses.map(clause => {
        bgraphEdgeQuery = executeBgraphEdges(bgraphEdgeQuery, clause);
      });
    }

    const bgraphNodeQueryResults = hasNodeFilters ? bgraphNodeQuery.unique().run() : [];
    const bgraphEdgeQueryResults = hasEdgeFilters ? bgraphEdgeQuery.unique().run() : [];
    const bgraphQueryResults = _.uniqBy(bgraphNodeQueryResults.concat(bgraphEdgeQueryResults), '_id');
    return deepCopy(bgraphQueryResults, ['_in', '_out']);
  }
};

/** Filters a BGraph, and returns back the filtres with aggregates. */
export function getBGraphAggregatesFromFiltres (
  bgraph: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  filtres: Filtres,
  fields: string[],
): Filtres {
  fields.forEach(field => {
    const bgraphResult = bgraph.v()
      .filter({ _type: FILTRES[field].graphType })
      .property(FILTRES[field].name)
      .run();

    let aggregates: FiltreAggregate[];
    switch (FILTRES[field].type) {
      case 'histogram':
        aggregates = FiltresUtil.bgraphResultsToHistogram(bgraphResult);
        break;
      default:
        aggregates = null;
    }

    const currentFiltre = filtres.get(field);
    if (currentFiltre) {
      const filtre: Filtre = Object.assign(filtres.get(field), { aggregates });
      filtres.set(field, filtre);
    }
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
  graferNodesData: Map<number, any>, // TODO: Change any type to Nodes Data Object in Grafer
  graferIntraEdgesData: Map<number, any>,
  graferInterEdgesData: Map<number, any>,
  graferClustersLabelsData: Map<number, any>,
): GraferLayerData[] => {
  // Deep copy results to avoid mutating passed in data
  const queryResultsDeepCopy = deepCopy(queryResults);
  const graferNodesDataResults = [];
  const graferIntraEdgesDataResults = [];
  const graferInterEdgesDataResults = [];
  const graferClusterIds: Set<number> = new Set();

  for (let i = 0; i < queryResultsDeepCopy.length; i++) {
    const result = queryResultsDeepCopy[i];
    if (result._type === 'node' && result.grafer_id != null) {
      // Set node color on query result
      graferNodesDataResults.push(graferNodesData.get(result.grafer_id));
      result.group_ids.map(id => graferClusterIds.add(id));
    } else if (result._type === 'edge' && result.intra_edge_id != null) {
      // Set intra edge color on query result
      graferIntraEdgesDataResults.push(graferIntraEdgesData.get(result.intra_edge_id));
    } else if (result._type === 'edge' && result.inter_edge_id != null) {
      // Set inter edge color on query result
      graferInterEdgesDataResults.push(graferInterEdgesData.get(result.inter_edge_id));
    }
  }

  const graferClusterDataResults = [];
  graferClusterIds.forEach(clusterId => graferClusterDataResults.push(graferClustersLabelsData.get(clusterId)));

  const highlightClusterLayer = buildHighlightClusterLayer('Highlights - Clusters', graferInterEdgesDataResults, graferClusterDataResults);
  const highlightNodeLayer = buildHighlightNodeLayer('Highlights - Nodes', graferNodesDataResults, graferIntraEdgesDataResults);

  return [highlightClusterLayer, highlightNodeLayer];
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const formatBGraphOutputToLocalGraph = (data: any): GraphInterface => {
  const nodes = [];
  const edges = [];
  const dataDeepCopy = deepCopy(data);
  dataDeepCopy.forEach(d => {
    if (d._type === 'node') {
      d.id = d._id;
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
