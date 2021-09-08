import { Filter } from '@/types/typesLex';
import { BIO_EDGE_TYPE_OPTIONS } from '@/utils/ModelTypeUtil';
import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';

// BIO PATH QUERIES
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const bioPathPre = (bgraphPathQuery, clause: Filter): any => {
  return bgraphPathQuery.filter(document => {
    if (document._type === 'node') {
      const node = document;
      return node.group_map[clause.values[0]] !== undefined;
    }
    // Document type is an edge
    return false;
  })
    .start()
    .unique();
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-module-boundary-types
const bioPathPreNodeFilterLoop = (bgraphPathQuery, _clause: Filter): any => {
  return bgraphPathQuery.out();
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-module-boundary-types
const bioPathPreEdgeFilterLoop = (bgraphPathQuery, _clause: Filter): any => {
  return bgraphPathQuery.out();
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const bioPathPost = (bgraphPathQuery, clause: Filter): any => {
  return bgraphPathQuery.suspend(document => {
    if (document._type === 'node') {
      const node = document;
      return node.group_map[clause.values[1]] !== undefined;
    }
    // Document type is an edge
    return false;
  })
    .repeat(5) // TODO: Implement cycle detection in bgraph to remove bio path length limit
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(_ => false)
    .unsuspend();
};

// EDGE QUERIES
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const bioEdgeType = (bgraphPathQuery, clause: Filter): any => {
  return bgraphPathQuery.filter(document => {
    if (document._type === 'edge') {
      const edge = document;
      return clause.values.some(typeIdx => BIO_EDGE_TYPE_OPTIONS[typeIdx] === edge.statement_type);
    }
    // Document is not an edge
    return false;
  });
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const bioEdgeDOI = (bgraphPathQuery, clause: Filter): any => {
  let dois = clause.values as string[];
  dois = dois.map(doi => doi.toLowerCase());
  return bgraphPathQuery.filter(document => {
    if (document._type === 'edge') {
      const edge = document;
      return dois.some(doi => Object.keys(edge.doi_map).some(edgeDoi => {
        return edgeDoi.toLowerCase().includes(doi);
      }));
    }
    // Document is not an edge
    return false;
  });
};

// NODE QUERIES

const propertyMatchQueryFactory = (config: any): (bgQuery: any, clause: Filter) => any => {
  return (bgQuery: any, clause: Filter): any => {
    let values = clause.values;

    if (config.matchType === 'string' && config.toLowerCase) {
      values = values.map(v => {
        if (typeof v === 'string') {
          return v.toLowerCase();
        } else {
          return v;
        }
      });
    }

    return bgQuery.filter(document => {
      if (document._type === config.documentType) {
        if (config.matchType === 'string') {
          return values.some(v => {
            let documentProperty = document[config.property];
            if (config.toLowerCase) documentProperty = documentProperty.toLowerCase();
            if (config.includes) {
              return documentProperty.includes(v);
            } else {
              return v === documentProperty;
            }
          });
        } else if (config.matchType === 'boolean') {
          return document[config.property] === Boolean(values[0]);
        } else if (config.matchType === 'number') {
          return values.some(v => {
            return document[config.property] === Number(v);
          });
        }
      }
      // Document is not specified document type
      return false;
    });
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const bioNodeGroup = (bgraphPathQuery, clause: Filter): any => {
  return bgraphPathQuery.filter(document => {
    if (document._type === 'node') {
      const node = document;
      return clause.values.some(group => node.group_map[group] !== undefined);
    }
    // Document type is an edge
    return false;
  });
};

const docsClustersNodeTitle = (bgraphPathQuery, clause: Filter): any => {
  let titles = clause.values as string[];
  // Filter fuzzy matches case insensitive titles
  titles = titles.map(title => title.toLowerCase());
  return bgraphPathQuery.filter(document => {
    if (document._type === 'node') {
      const node = document;
      return titles.some(title => node.label.toLowerCase().includes(title));
    }
    // Document is not a node
    return false;
  });
};
const docsClustersNodeDOI = (bgraphPathQuery, clause: Filter): any => {
  const dois = clause.values as string[];
  return bgraphPathQuery.filter(document => {
    if (document._type === 'node') {
      const node = document;
      const nodeDOI = node.extras?.bibjson?.identifier?.find(d => d.type === 'doi')?.id;
      if (!nodeDOI) {
        return false;
      }
      return dois.some(doi => nodeDOI.includes(doi));
    }
    // Document is not a node
    return false;
  });
};

// EPI PATH QUERIES
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const epiPathPre = (bgraphPathQuery, clause: Filter): any => {
  return bgraphPathQuery.filter(document => {
    if (document._type === 'node') {
      const node = document;
      return clause.values[0] === node.label;
    }
    // Document type is an edge
    return false;
  })
    .start()
    .unique();
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-module-boundary-types
const epiPathPreNodeFilterLoop = (bgraphPathQuery, _clause: Filter): any => {
  return bgraphPathQuery.out();
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-module-boundary-types
const epiPathPreEdgeFilterLoop = (bgraphPathQuery, _clause: Filter): any => {
  return bgraphPathQuery.out();
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const epiPathPost = (bgraphPathQuery, clause: Filter): any => {
  return bgraphPathQuery.suspend(document => {
    if (document._type === 'node') {
      const node = document;
      return clause.values[1] === node.label;
    }
    // Document type is an edge
    return false;
  })
    .repeat(15) // TODO: Implement cycle detection in bgraph to remove epi path length limit
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(_ => false)
    .unsuspend();
};

// Add filter terms here to change the order in which they are processed in bgraph
export const EDGE_PRIORITY_RANK = 2;
export const NODE_PRIORITY_RANK = 4;
export const PATH_PRIORITY_RANK = 7;
export const filterTermToPriorityRank = {
  // BIO Edge Terms
  [QUERY_FIELDS_MAP.BIO_EDGE_PRE.field]: 1,
  [QUERY_FIELDS_MAP.BIO_EDGE_TESTED.field]: EDGE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_EDGE_TYPE.field]: EDGE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_EDGE_DOI.field]: EDGE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_EDGE_POST.field]: 3,
  // BIO Node Terms
  [QUERY_FIELDS_MAP.BIO_NODE_PRE.field]: 4,
  [QUERY_FIELDS_MAP.BIO_NODE_NAME.field]: NODE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_NODE_GROUP.field]: NODE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_NODE_GROUNDED.field]: NODE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_NODE_GROUNDED_ONTO.field]: NODE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_NODE_IN_DEGREE.field]: NODE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_NODE_OUT_DEGREE.field]: NODE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_NODE_POST.field]: 6,
  // BIO Path Terms
  [QUERY_FIELDS_MAP.BIO_PATH_PRE.field]: 0,
  [QUERY_FIELDS_MAP.BIO_PATH_PRE_EDGE_FILTER_LOOP.field]: 1,
  [QUERY_FIELDS_MAP.BIO_PATH_PRE_NODE_FILTER_LOOP.field]: 3,
  [QUERY_FIELDS_MAP.BIO_PATH.field]: PATH_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.BIO_PATH_POST.field]: 8,
  // EPI Path Terms
  [QUERY_FIELDS_MAP.EPI_PATH_PRE.field]: 0,
  [QUERY_FIELDS_MAP.EPI_PATH_PRE_EDGE_FILTER_LOOP.field]: 1,
  [QUERY_FIELDS_MAP.EPI_PATH_PRE_NODE_FILTER_LOOP.field]: 3,
  [QUERY_FIELDS_MAP.EPI_PATH.field]: PATH_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.EPI_PATH_POST.field]: 8,
  // DOCS Node Terms
  [QUERY_FIELDS_MAP.DOCS_CLUSTERS_NODE_TITLE.field]: NODE_PRIORITY_RANK,
  [QUERY_FIELDS_MAP.DOCS_CLUSTERS_NODE_DOI.field]: NODE_PRIORITY_RANK,
};

// Assume that bgraph instance passed in has already been initialized
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const executeBgraphEdges = (bgraphEdgeQuery, clause: Filter): any => {
  switch (clause.field) {
    // EDGE CLAUSES
    case QUERY_FIELDS_MAP.BIO_EDGE_PRE.field: return bgraphEdgeQuery;
    case QUERY_FIELDS_MAP.BIO_EDGE_TESTED.field: return propertyMatchQueryFactory(QUERY_FIELDS_MAP.BIO_EDGE_TESTED.queryFunctionConfig)(bgraphEdgeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_EDGE_TYPE.field: return bioEdgeType(bgraphEdgeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_EDGE_DOI.field: return bioEdgeDOI(bgraphEdgeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_EDGE_POST.field: return bgraphEdgeQuery.as('edgeOnly').out().as('target').back('edgeOnly').in().as('source').merge('edgeOnly', 'source', 'target');
    default: return bgraphEdgeQuery;
  }
};

// Assume that bgraph instance passed in has already been initialized
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const executeBgraphPathQuery = (bgraphPathQuery, clause: Filter): any => {
  switch (clause.field) {
    // BIO PATH CLAUSES
    case QUERY_FIELDS_MAP.BIO_PATH_PRE.field: return bioPathPre(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_PATH_PRE_NODE_FILTER_LOOP.field: return bioPathPreNodeFilterLoop(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_PATH_PRE_EDGE_FILTER_LOOP.field: return bioPathPreEdgeFilterLoop(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_EDGE_TESTED.field: return propertyMatchQueryFactory(QUERY_FIELDS_MAP.BIO_EDGE_TESTED.queryFunctionConfig)(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_EDGE_TYPE.field: return bioEdgeType(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_EDGE_DOI.field: return bioEdgeDOI(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_NAME.field: return propertyMatchQueryFactory(QUERY_FIELDS_MAP.BIO_NODE_NAME.queryFunctionConfig)(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_GROUP.field: return bioNodeGroup(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED.field: return propertyMatchQueryFactory(QUERY_FIELDS_MAP.BIO_NODE_GROUNDED.queryFunctionConfig)(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED_ONTO.field: return propertyMatchQueryFactory(QUERY_FIELDS_MAP.BIO_NODE_GROUNDED_ONTO.queryFunctionConfig)(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_IN_DEGREE.field: return propertyMatchQueryFactory(QUERY_FIELDS_MAP.BIO_NODE_IN_DEGREE.queryFunctionConfig)(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_OUT_DEGREE.field: return propertyMatchQueryFactory(QUERY_FIELDS_MAP.BIO_NODE_OUT_DEGREE.queryFunctionConfig)(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_PATH_POST.field: return bioPathPost(bgraphPathQuery, clause);
    // EPI PATH CLAUSES
    case QUERY_FIELDS_MAP.EPI_PATH_PRE.field: return epiPathPre(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.EPI_PATH_PRE_NODE_FILTER_LOOP.field: return epiPathPreNodeFilterLoop(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.EPI_PATH_PRE_EDGE_FILTER_LOOP.field: return epiPathPreEdgeFilterLoop(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.EPI_PATH_POST.field: return epiPathPost(bgraphPathQuery, clause);
    default: return bgraphPathQuery;
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const executeBgraphNodes = (bgraphNodeQuery: any, clause: Filter): any => {
  switch (clause.field) {
    // NODE CLAUSES
    case QUERY_FIELDS_MAP.BIO_NODE_PRE.field: return bgraphNodeQuery;
    case QUERY_FIELDS_MAP.BIO_NODE_NAME.field: return propertyMatchQueryFactory(QUERY_FIELDS_MAP.BIO_NODE_NAME.queryFunctionConfig)(bgraphNodeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_GROUP.field: return bioNodeGroup(bgraphNodeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED.field: return propertyMatchQueryFactory(QUERY_FIELDS_MAP.BIO_NODE_GROUNDED.queryFunctionConfig)(bgraphNodeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED_ONTO.field: return propertyMatchQueryFactory(QUERY_FIELDS_MAP.BIO_NODE_GROUNDED_ONTO.queryFunctionConfig)(bgraphNodeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_IN_DEGREE.field: return propertyMatchQueryFactory(QUERY_FIELDS_MAP.BIO_NODE_IN_DEGREE.queryFunctionConfig)(bgraphNodeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_OUT_DEGREE.field: return propertyMatchQueryFactory(QUERY_FIELDS_MAP.BIO_NODE_OUT_DEGREE.queryFunctionConfig)(bgraphNodeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_POST.field: return bgraphNodeQuery;
    // DOC CLAUSES
    // TODO: Currently we are using the BIO_NODE_PRE/POST for document cluster queries
    // as they both just return the query but may want to differentiate in the future.
    // case QUERY_FIELDS_MAP.DOCS_NODE_PRE.field: return bgraphNodeQuery;
    case QUERY_FIELDS_MAP.DOCS_CLUSTERS_NODE_TITLE.field: return docsClustersNodeTitle(bgraphNodeQuery, clause);
    case QUERY_FIELDS_MAP.DOCS_CLUSTERS_NODE_DOI.field: return docsClustersNodeDOI(bgraphNodeQuery, clause);
    // case QUERY_FIELDS_MAP.DOCS_NODE_POST.field: return bgraphNodeQuery;
    default: return bgraphNodeQuery;
  }
};
