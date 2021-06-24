import { Filter } from '@/types/typesLex';
import { BIO_EDGE_TYPE_OPTIONS } from '@/utils/ModelTypeUtil';
import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';

// BIO PATH QUERIES
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function bioPathPre (bgraphPathQuery, clause: Filter): any {
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
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-module-boundary-types
function bioPathPreNodeFilterLoop (bgraphPathQuery, _clause: Filter): any {
  return bgraphPathQuery.out();
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-module-boundary-types
function bioPathPreEdgeFilterLoop (bgraphPathQuery, _clause: Filter): any {
  return bgraphPathQuery.out();
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function bioPathPost (bgraphPathQuery, clause: Filter): any {
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
}

// EDGE QUERIES
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function bioEdgeTested (bgraphPathQuery, clause: Filter): any {
  return bgraphPathQuery.filter(document => {
    if (document._type === 'edge') {
      const edge = document;
      return edge.tested === Boolean(clause.values[0]);
    }
    // Document is not an edge
    return false;
  });
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function bioEdgeType (bgraphPathQuery, clause: Filter): any {
  return bgraphPathQuery.filter(document => {
    if (document._type === 'edge') {
      const edge = document;
      return clause.values.some(typeIdx => BIO_EDGE_TYPE_OPTIONS[typeIdx] === edge.statement_type);
    }
    // Document is not an edge
    return false;
  });
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function bioEdgeDOI (bgraphPathQuery, clause: Filter): any {
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
}

// NODE QUERIES
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function bioNodeName (bgraphPathQuery, clause: Filter): any {
  let names = clause.values as string[];
  // Filter matching case insensitive names
  names = names.map(name => name.toLowerCase());
  return bgraphPathQuery.filter(document => {
    if (document._type === 'node') {
      const node = document;
      return names.some(name => name === node.name.toLowerCase());
    }
    // Document is not a node
    return false;
  });
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function bioNodeGroup (bgraphPathQuery, clause: Filter): any {
  return bgraphPathQuery.filter(document => {
    if (document._type === 'node') {
      const node = document;
      return clause.values.some(group => node.group_map[group] !== undefined);
    }
    // Document type is an edge
    return false;
  });
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function bioNodeGrounded (bgraphPathQuery, clause: Filter): any {
  return bgraphPathQuery.filter(document => {
    if (document._type === 'node') {
      const node = document;
      return node.grounded_db === Boolean(clause.values[0]);
    }
    // Document type is an edge
    return false;
  });
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function bioNodeGroundedOnto (bgraphPathQuery, clause: Filter): any {
  return bgraphPathQuery.filter(document => {
    if (document._type === 'node') {
      const node = document;
      return node.grounded_group === Boolean(clause.values[0]);
    }
    // Document type is an edge
    return false;
  });
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function bioNodeInDegree (bgraphPathQuery, clause: Filter): any {
  return bgraphPathQuery.filter(document => {
    if (document._type === 'node') {
      const node = document;
      return clause.values.some(value => node.in_degree === Number(value));
    }
    // Document type is an edge
    return false;
  });
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function bioNodeOutDegree (bgraphPathQuery, clause: Filter): any {
  return bgraphPathQuery.filter(document => {
    if (document._type === 'node') {
      const node = document;
      return clause.values.some(value => node.out_degree === Number(value));
    }
    // Document type is an edge
    return false;
  });
}

// EPI PATH QUERIES
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function epiPathPre (bgraphPathQuery, clause: Filter): any {
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
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-module-boundary-types
function epiPathPreNodeFilterLoop (bgraphPathQuery, _clause: Filter): any {
  return bgraphPathQuery.in(); // TODO: Why are edge directions backward??
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-module-boundary-types
function epiPathPreEdgeFilterLoop (bgraphPathQuery, _clause: Filter): any {
  return bgraphPathQuery.in(); // TODO: Why are edge directions backward??
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function epiPathPost (bgraphPathQuery, clause: Filter): any {
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
}

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
};

// Assume that bgraph instance passed in has already been initialized
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const executeBgraphEdges = (bgraphEdgeQuery, clause: Filter): any => {
  switch (clause.field) {
    // EDGE CLAUSES
    case QUERY_FIELDS_MAP.BIO_EDGE_PRE.field: return bgraphEdgeQuery;
    case QUERY_FIELDS_MAP.BIO_EDGE_TESTED.field: return bioEdgeTested(bgraphEdgeQuery, clause);
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
    case QUERY_FIELDS_MAP.BIO_EDGE_TESTED.field: return bioEdgeTested(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_EDGE_TYPE.field: return bioEdgeType(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_EDGE_DOI.field: return bioEdgeDOI(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_NAME.field: return bioNodeName(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_GROUP.field: return bioNodeGroup(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED.field: return bioNodeGrounded(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED_ONTO.field: return bioNodeGroundedOnto(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_IN_DEGREE.field: return bioNodeInDegree(bgraphPathQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_OUT_DEGREE.field: return bioNodeOutDegree(bgraphPathQuery, clause);
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
    case QUERY_FIELDS_MAP.BIO_NODE_NAME.field: return bioNodeName(bgraphNodeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_GROUP.field: return bioNodeGroup(bgraphNodeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED.field: return bioNodeGrounded(bgraphNodeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED_ONTO.field: return bioNodeGroundedOnto(bgraphNodeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_IN_DEGREE.field: return bioNodeInDegree(bgraphNodeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_OUT_DEGREE.field: return bioNodeOutDegree(bgraphNodeQuery, clause);
    case QUERY_FIELDS_MAP.BIO_NODE_POST.field: return bgraphNodeQuery;
    default: return bgraphNodeQuery;
  }
};
