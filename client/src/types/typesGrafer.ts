import { GraferNodesData, GraferEdgesData, GraferPointsData, GraferLabelsData } from '@uncharted.software/grafer';

// NOTE: If we have more Grafer instances we may want to standardize the data payloads to a set
export interface BioGraferLayerDataPayloadInterface {
  graferPointsData: GraferPointsData;
  graferNodesData: GraferNodesData;
  graferIntraEdgesData: GraferEdgesData;
  graferInterEdgesData: GraferEdgesData;
  graferClustersLabelsData: GraferLabelsData;
}
