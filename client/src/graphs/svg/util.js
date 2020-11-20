import _ from 'lodash';
import { Colors, NodeTypes } from '@/graphs/svg/encodings.ts';

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

export const formatHierarchyNodeData = (root) => {
  root.concept = root.data.concept;
  root.label = root.data.label;
  root.nodeType = root.data.nodeType;
  root.metadata = root.data.metadata;
  if (root.nodeType === NodeTypes.NODES.VARIABLE) {
    root.varType = root.data.varType;
  }
  if (root.metadata && root.data.metadata.attributes) {
    root.role = root.data.metadata.attributes[0].code_role;
  }
  if (root.children) {
    root.nodes = root.children;
    delete root.children;
    for (let i = 0; i < root.nodes.length; i++) {
      formatHierarchyNodeData(root.nodes[i]);
    }
  }
};

/**
 * Get the neighborhood graph for a selected node
 * @param {object} graph - an object of nodes/edges arrays
 * @param {string} node - a node id
 */

export const calculateNeighborhood = (graph, node) => {
  const neighborEdges = graph.edges.filter(edge =>
    edge.target === node || edge.source === node).map(edge => ({ source: edge.source, target: edge.target }));

  // Reverse-engineer nodes from edges
  const neighborNodes = _.uniq(_.flatten(neighborEdges.map(edge => {
    return [edge.source, edge.target];
  })).concat(node)).map(id => ({ id })); // Include the selected node (added into .uniq)

  return { nodes: neighborNodes, edges: neighborEdges };
};

export const calcNodeColor = (node) => {
  if (node.nodes) {
    return Colors.NODES.CONTAINER;
  } else if (node.data.nodeType === NodeTypes.NODES.VARIABLE) {
    const type = node.data.varType;
    if (type === NodeTypes.VARIABLES.MODEL_VARIABLE) {
      return Colors.NODES.MODEL_VARIABLE;
    }
    if (type === NodeTypes.VARIABLES.PARAMETER) {
      return Colors.NODES.PARAMETER;
    }
  }
  return Colors.NODES.DEFAULT;
};
