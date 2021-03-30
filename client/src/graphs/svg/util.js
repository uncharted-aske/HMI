import _ from 'lodash';
import { Colors, NodeTypes, EdgeTypes } from '@/graphs/svg/encodings.ts';

/**
 * Recursively traverse a graph that looks like
 * {
 *   nodes: [
 *     {
 *       nodes: [
 *         {
 *           nodes: [ ... ],
 *           edges: [ ... ]
 *         }
 *       ],
 *       edges: [ ... ]
 *     },
 *     ...
 *   ],
 *   edges: [...]
 * }
 */
export const traverse = (root, callBackFn, depth = 0) => {
  callBackFn(root, depth);
  if (root.nodes) {
    const d = depth + 1;
    for (let i = 0; i < root.nodes.length; i++) {
      traverse(root.nodes[i], callBackFn, d);
    }
  }
};

/**
 * Returns a flat representation of all nodes and edges.
 */
export const flatten = (root) => {
  let nodes = [];
  let edges = [];

  traverse(root, (node, depth) => {
    if (depth > 0) {
      nodes = nodes.concat(node);
    }
    if (node.edges) {
      edges = edges.concat(node.edges);
    }
  });
  return {
    nodes, edges,
  };
};

/**
 * Figure out the number of incoming and outgoing edges per node
 */
export const makeEdgeMaps = (root) => {
  const incoming = {};
  const outgoing = {};

  traverse(root, (node) => {
    if (node.edges) {
      node.edges.forEach(edge => {
        const source = edge.source;
        const target = edge.target;

        if (!{}.hasOwnProperty.call(outgoing, source)) {
          outgoing[source] = 1;
        } else {
          outgoing[source] = outgoing[source] + 1;
        }

        if (!{}.hasOwnProperty.call(incoming, target)) {
          incoming[target] = 1;
        } else {
          incoming[target] = incoming[target] + 1;
        }
      });
    }
  });

  return {
    incoming,
    outgoing,
  };
};

export const changeKey = (obj, before, after) => {
  if ({}.hasOwnProperty.call(obj, before)) {
    obj[after] = obj[before];
    delete obj[before];
    obj[after].forEach(child => {
      changeKey(child, before, after);
    });
  }
};

/**
 * Given a nested representation of nodes computed by d3.stratify, it formats it to one that can be used by the renderer
* {
 *   id:...,
 *   nodes: [
 *      id: ...,
 *      nodes: []
 *    ]
 * }
 */

export const constructRootNode = (root) => {
  root.label = root.data.label;
  root.concept = root.data.concept;
  changeKey(root, 'children', 'nodes');

  if (root.nodes) {
    for (let i = 0; i < root.nodes.length; i++) {
      constructRootNode(root.nodes[i]);
    }
  }
};

export const formatBGraphOutput = (data) => {
  const nodes = [];
  const edges = [];
  data.forEach(d => {
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

/**
 * Get the neighborhood graph for a selected node
 * @param {object} graph - an object of nodes/edges arrays
 * @param {string} node - a node object
 */

export const calculateNodeNeighborhood = (graph, node) => {
  const neighborEdges = graph.edges.filter(edge =>
    edge.target === node.id || edge.source === node.id).map(edge => ({ source: edge.source, target: edge.target }));

  // Reverse-engineer nodes from edges
  const neighborNodes = _.uniq(_.flatten(neighborEdges.map(edge => {
    return [edge.source, edge.target];
  }))).map(id => id);

  return { nodes: neighborNodes, edges: neighborEdges };
};

export const calculateEdgeNeighborhood = (edge) => {
  return {
    edges: [{ source: edge.source, target: edge.target }],
    nodes: [edge.source, edge.target],
  };
};

export const calcNodeColor = (node) => {
  if (node.nodes) {
    // Distinction between the main container and the rest
    return node.depth === 2 ? Colors.NODES.ROOT_CONTAINER : Colors.NODES.CONTAINER;
  } else
  if (node.nodeType === NodeTypes.NODES.VARIABLE) {
    if (node.nodeSubType) {
      if (node.nodeSubType.includes(NodeTypes.VARIABLES.MODEL_VARIABLE)) {
        return Colors.NODES.MODEL_VARIABLE;
      }
      if (node.nodeSubType.includes(NodeTypes.VARIABLES.INITIAL_CONDITION)) {
        return Colors.NODES.INITIAL_CONDITION;
      }
    }
  } else if (node.nodeType === NodeTypes.NODES.OVERLAPPING) {
    return Colors.NODES.OVERLAPPING;
  }
  return Colors.NODES.DEFAULT;
};

export const calcLabelColor = (node) => {
  return node.nodes ? Colors.LABELS.LIGHT : Colors.LABELS.DARK;
};

/**
 * Calculate edge colors for biological graphs
 *  - ACTIVATION/INCREASEAMOUNT: BLUE
 *  - INHIBITION/DECREASEAMOUNT: RED
 *
 */

export const calcEdgeColor = (edge) => {
  if (edge.data.edgeType) {
    if (edge.data.edgeType === EdgeTypes.EDGES.ACTIVATION || edge.data.edgeType === EdgeTypes.EDGES.INCREASEAMOUNT) {
      return Colors.POLARITY.POSITIVE;
    } else if (edge.data.edgeType === EdgeTypes.EDGES.INHIBITION || edge.data.edgeType === EdgeTypes.EDGES.DECREASEAMOUNT) {
      return Colors.POLARITY.NEGATIVE;
    } else return Colors.EDGES.DEFAULT;
  }
  return Colors.EDGES.DEFAULT;
};

/**
 * Calculate edge control filling according to the curation status of a statement
 * incorrect - 0
 * correct - 1
 * partial - 2
 * uncurated - 3
 */
export const calcEdgeControlBackground = (edge) => {
  const curated = edge.data.metadata.curated;
  if (curated === EdgeTypes.CURATION_STATUS.INCORRECT) {
    return Colors.CURATION.INCORRECT;
  } else if (curated === EdgeTypes.CURATION_STATUS.CORRECT) {
    return Colors.CURATION.CORRECT;
  } else if (curated === EdgeTypes.CURATION_STATUS.PARTIAL) {
    return Colors.CURATION.PARTIAL;
  }
  return Colors.CURATION.UNCURATED;
};

export const calculateEdgeControlLabels = (edge) => {
  const type = edge.data.edgeType;
  switch (type) {
    case EdgeTypes.EDGES.ACTIVATION:
      return 'A';
    case EdgeTypes.EDGES.INHIBITION:
      return 'I';
    case EdgeTypes.EDGES.INCREASEAMOUNT:
      return '+';
    case EdgeTypes.EDGES.PHOSPORYLATION:
      return 'P';
    case EdgeTypes.EDGES.DEPHOSPORYLATION:
      return 'D';
    default:
      return '';
  }
};
