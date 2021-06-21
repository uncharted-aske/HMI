import { Filter } from '@/types/typesLex';
import { BIO_EDGE_TYPE_OPTIONS } from '@/utils/ModelTypeUtil';

// PATH QUERIES
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function bioPathPre (bgraphPathQuery: any, clause: Filter): any {
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
export function bioPathPreNodeFilterLoop (bgraphPathQuery, _clause: Filter): any {
  return bgraphPathQuery.out();
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-module-boundary-types
export function bioPathPreEdgeFilterLoop (bgraphPathQuery, _clause: Filter): any {
  return bgraphPathQuery.out();
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function bioPathPost (bgraphPathQuery, clause: Filter): any {
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
export function bioEdgeTested (bgraphPathQuery, clause: Filter): any {
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
export function bioEdgeType (bgraphPathQuery, clause: Filter): any {
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
export function bioEdgeDOI (bgraphPathQuery, clause: Filter): any {
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
export function bioNodeName (bgraphPathQuery, clause: Filter): any {
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
export function bioNodeGroup (bgraphPathQuery, clause: Filter): any {
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
export function bioNodeGrounded (bgraphPathQuery, clause: Filter): any {
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
export function bioNodeGroundedOnto (bgraphPathQuery, clause: Filter): any {
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
export function bioNodeInDegree (bgraphPathQuery, clause: Filter): any {
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
export function bioNodeOutDegree (bgraphPathQuery, clause: Filter): any {
  return bgraphPathQuery.filter(document => {
    if (document._type === 'node') {
      const node = document;
      return clause.values.some(value => node.out_degree === Number(value));
    }
    // Document type is an edge
    return false;
  });
}
