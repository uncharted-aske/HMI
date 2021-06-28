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
  if (node.nodes) {
    return Colors.LABELS.LIGHT;
  } else {
    return node.data.role?.includes(NodeTypes.NODES.PARAMETER) ? Colors.LABELS.LIGHT : Colors.LABELS.DARK;
  }
};

/**
 * Calculate edge colors for biological graphs
 *  - ACTIVATION/INCREASEAMOUNT: BLUE
 *  - INHIBITION/DECREASEAMOUNT: RED
 *
 */

export const calcEdgeColor = (edge) => {
  if (edge.data.statement_type) {
    if (edge.data.statement_type === EdgeTypes.EDGES.ACTIVATION || edge.data.statement_type === EdgeTypes.EDGES.INCREASEAMOUNT) {
      return Colors.POLARITY.POSITIVE;
    } else if (edge.data.statement_type === EdgeTypes.EDGES.INHIBITION || edge.data.statement_type === EdgeTypes.EDGES.DECREASEAMOUNT) {
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
  const curated = edge.data.curated;
  if (curated === EdgeTypes.CURATION_STATUS.INCORRECT) {
    return Colors.CURATION.INCORRECT;
  } else if (curated === EdgeTypes.CURATION_STATUS.CORRECT) {
    return Colors.CURATION.CORRECT;
  } else if (curated === EdgeTypes.CURATION_STATUS.PARTIAL) {
    return Colors.CURATION.PARTIAL;
  }
  return Colors.CURATION.UNCURATED;
};


/**
  * Collapse top-level boxes by default for scalability. 
  * Criteria: parent nodes and node depth = 1
*/
export function collapseDefault (root, renderer) {
  if (root.nodes && root.depth === 1) {
    renderer.collapse(root.id);
  }
  if (root.nodes) {
    for (let i = 0; i < root.nodes.length; i++) {
      collapseDefault(root.nodes[i]);
    }
  }
}
