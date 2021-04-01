import { graph, GraferLayerData } from '@uncharted.software/grafer';

export const clusterLabelOptions = { color: 3 };

export const clusterEdgeOptions = {
  sourceColor: 0,
  targetColor: 0,
};

export const nodeOptions = { color: 1 };

export const nodeEdgeOptions = {
  sourceColor: 2,
  targetColor: 2,
};

// TODO: Move all common Grafer layer configurations to utility to reduce boilerplate code within
//       application logic
export const buildHighlightClusterLayer = (name: string, edges: GraferLayerData, clusters: GraferLayerData): GraferLayerData => {
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

export const buildHighlightNodeLayer = (name: string, nodes: GraferLayerData, edges: GraferLayerData): GraferLayerData => {
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
