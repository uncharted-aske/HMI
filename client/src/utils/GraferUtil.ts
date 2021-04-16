import { COLORS } from '@/utils/colorsUtil';

export const BIO_GRAPH_COLORS = [
  COLORS.FROST_4_DEEP_ARCTIC_OCEAN, // Used for edges between clusters (inter edges)
  COLORS.AURORA_2_ORANGE, // Used for nodes
  COLORS.AURORA_3_YELLOW, // Used for edges within clusters (intra edge)
  COLORS.FROST_3_ARCTIC_OCEAN, // Used for cluster rings
];

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
