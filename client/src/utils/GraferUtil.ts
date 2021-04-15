import { COLORS } from '@/utils/colorsUtil';

// TODO: Create a standard set of Grafer layer config options for common use
//       cases and reuse them for similar graphs

// Bio Graph Layer configuration options
export const BIO_GRAPH_COLORS = [
  COLORS.FROST_4_DEEP_ARCTIC_OCEAN, // Used for edges between clusters (inter edges)
  COLORS.AURORA_2_ORANGE, // Used for nodes
  COLORS.AURORA_3_YELLOW, // Used for edges within clusters (intra edge)
  COLORS.FROST_3_ARCTIC_OCEAN, // Used for cluster rings
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
  COLORS.SNOW_STORM_1, // Used for non-highlighted node labels
  // NOTE: Since there are more clusters then colors these colors do not map to any one particular
  //       cluster but may be used in multiple clusters
  COLORS.AURORA_1_RED, // Used for highlighted nodes labels and as one of various background node colors
  COLORS.AURORA_2_ORANGE, // Used for nodes to signify cluster relationship with other nodes
  COLORS.AURORA_3_YELLOW, // Used for nodes to signify cluster relationship with other nodes
  COLORS.AURORA_4_GREEN, // Used for nodes to signify cluster relationship with other nodes
  COLORS.AURORA_5_PURPLE, // Used for nodes to signify cluster relationship with other nodes
];
