import s3Client from '@/services/S3Service';
import { loadJSONLFile } from '@/utils/FileLoaderUtil';

import { Filters, Filter } from '@/types/typesLex';
import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';

const memoizedStore = { bgEdges: null, bgNodes: null };

function deepCopy (inObject, keyBlackList?: Array<any>): any {
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
}

// FIXME: Fix return type once bgraph library types are added
export const loadBGraphData = (): Promise<any[]> => {
  if (!memoizedStore.bgEdges) {
    memoizedStore.bgEdges = new Promise((resolve) => {
      const getSignedBGraphEdgesUrl = s3Client.getSignedUrl('getObject', {
        Bucket: process.env.S3_BUCKET,
        Key: process.env.S3_BGRAPH_EDGES_KEY,
      });
      resolve(loadJSONLFile(getSignedBGraphEdgesUrl));
    });
  }

  if (!memoizedStore.bgNodes) {
    memoizedStore.bgNodes = new Promise((resolve) => {
      const getSignedBGraphNodesUrl = s3Client.getSignedUrl('getObject', {
        Bucket: process.env.S3_BUCKET,
        Key: process.env.S3_BGRAPH_NODES_KEY,
      });
      resolve(loadJSONLFile(getSignedBGraphNodesUrl));
    });
  }

  return Promise.all([memoizedStore.bgNodes, memoizedStore.bgEdges]);
};

const filterTermToPriorityRank = {

};

// Assume that bgraph instance passed in has already been initialized
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const executeBgraph = (bgraph: any, clause: Filter): any => {
  switch (clause.field) {
    case QUERY_FIELDS_MAP.BIO_NODE_NAME.field: {
      return bgraph.filter(node => clause.values.indexOf(node.name) !== -1);
    }
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED.field: {
      return bgraph.filter(node => node.grounded === Boolean(clause.values[0]));
    }
    case QUERY_FIELDS_MAP.BIO_NODE_GROUNDED_ONTO.field: {
      return bgraph.filter(node => node.grounded_onto === Boolean(clause.values[0]));
    }
    case QUERY_FIELDS_MAP.BIO_NODE_IN_DEGREE.field: {
      return bgraph.filter(node => node.in_degree === Number(clause.values[0]));
    }
    case QUERY_FIELDS_MAP.BIO_NODE_OUT_DEGREE.field: {
      return bgraph.filter(node => node.out_degree === Number(clause.values[0]));
    }
    default: {
      return bgraph;
    }
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const filterToBgraph = (bgraph: any, filters: Filters): any => {
  if (!bgraph || !filters || !filters.clauses || filters.clauses.length === 0) {
    return; // no-op
  }

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
};
