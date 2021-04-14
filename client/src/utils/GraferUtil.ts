import { GraferNodesData, GraferEdgesData, GraferLabelsData, graph } from '@uncharted.software/grafer';

// Bio Graph Layer configuration options
// TODO: Create a standard set of Grafer layer config options for common use
//       cases and reuse them for similar graphs
export const BIO_GRAPH_COLORS = [
  '#5e81ac',
  '#d08770',
  '#ebcb8b',
  '#81a1c1',
];
export const BIO_NODE_LAYERS_NODE_OPTIONS = { color: 1 };
export const BIO_NODE_LAYERS_EDGE_OPTIONS = {
  sourceColor: 2,
  targetColor: 2,
};
export const BIO_CLUSTER_LAYERS_LABEL_OPTIONS = { color: 3 };
export const BIO_CLUSTER_LAYERS_EDGE_OPTIONS = {
  sourceColor: 0,
  targetColor: 0,
};

// Knowledge Cluster Graph Layer configuration options
export const CLUSTER_GRAPH_COLORS = [
  '#bf616a',
  '#d08770',
  '#ebcb8b',
  '#a3be8c',
  '#b48ead',
  '#d8dee9',
];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const buildHighlightClusterLayer = (name: string, edges: GraferEdgesData, clusters: GraferLabelsData) => {
  return {
    name,
    labels: {
      type: 'RingLabel',
      data: clusters,
      mappings: {
        background: (): boolean => false,
        fontSize: (): number => 14,
        padding: (): number => 0,
      },
      options: {
        visibilityThreshold: 160,
        repeatLabel: -1,
        repeatGap: 64,
        nearDepth: 0.0,
        farDepth: 0.4,
      },
    },
    edges: {
      type: 'ClusterBundle',
      data: edges,
      options: {
        alpha: Math.min(0.99, Math.max(0.2, 1 - ((1 / 4100) * edges.length))),
        nearDepth: 0.1,
        farDepth: 0.4,
      },
    },
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const buildHighlightNodeLayer = (name: string, nodes: GraferNodesData, edges: GraferEdgesData) => {
  return {
    name,
    nodes: {
      type: 'Circle',
      data: nodes,
      options: {
        nearDepth: 0.0,
        farDepth: 0.4,
      },
    },
    edges: {
      data: edges,
      options: {
        alpha: 0.55,
      },
    },
    labels: {
      type: 'PointLabel',
      data: nodes,
      mappings: {
        background: (): boolean => true,
        fontSize: (): number => 12,
        padding: (): [number, number] => [8, 5],
      },
      options: {
        visibilityThreshold: 8,
        labelPlacement: graph.labels.PointLabelPlacement.TOP,
        nearDepth: 0.0,
        farDepth: 0.4,
      },
    },
  };
};
