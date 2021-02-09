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
  const data = root.data;
  root.concept = data.concept;
  root.label = data.label;
  root.nodeType = data.nodeType;
  root.nodeSubType = data.nodeSubType;
  root.metadata = data.metadata;

  if (root.metadata && root.metadata.attributes) {
    root.role = root.metadata.attributes[0].code_role;
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
 * @param {string} node - a node object
 */

export const calculateNodeNeighborhood = (graph, node) => {
  const neighborEdges = graph.edges.filter(edge =>
    edge.target === node.id || edge.source === node.id).map(edge => ({ source: edge.source, target: edge.target }));

  // Reverse-engineer nodes from edges
  let neighborNodes = [];
  // if (node.nodes) {
  //   neighborNodes = flatten(node).nodes.map(n => n.id).concat(node.id);
  // } else {
  neighborNodes = _.uniq(_.flatten(neighborEdges.map(edge => {
    return [edge.source, edge.target];
  })).concat(node)).map(id => ({ id })); // Include the selected node (added into .uniq)
  // }

  return { nodes: neighborNodes, edges: neighborEdges };
};

export const calculateEdgeNeighborhood = (edge) => {
  return {
    edges: [{ source: edge.source, target: edge.target }],
    nodes: [{ id: edge.source }, { id: edge.target }],
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
  }
  return Colors.NODES.DEFAULT;
};

export const calcLabelColor = (node) => {
  return node.nodes ? Colors.LABELS.LIGHT : Colors.LABELS.DARK;
};
