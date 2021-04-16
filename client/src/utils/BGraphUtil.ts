import s3Client from '@/services/S3Service';
import { loadJSONLFile } from '@/utils/FileLoaderUtil';
import { DataFile } from '@dekkai/data-source';

import { Filters, Filter } from '@/types/typesLex';
import { GraphInterface } from '@/types/typesGraphs';
import { QUERY_FIELDS_MAP } from '@/utils/QueryFieldsUtil';
import { isEmpty } from './FiltersUtil';

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
      return bgraph.filter(node => clause.values.indexOf(node.name) !== -1);
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
