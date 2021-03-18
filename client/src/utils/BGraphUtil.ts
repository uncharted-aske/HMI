import s3Client from '@/services/S3Service';
import { loadJSONLFile } from '@/utils/FileLoaderUtil';

// FIXME: Fix return type once bgraph library types are added
export const loadBGraphData = async (): Promise<any[]> => {
  const getSignedBGraphEdgesUrl = s3Client.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET,
    Key: process.env.S3_BGRAPH_EDGES_KEY,
  });
  const bgEdges = await loadJSONLFile(getSignedBGraphEdgesUrl);

  const getSignedBGraphNodesUrl = s3Client.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET,
    Key: process.env.S3_BGRAPH_NODES_KEY,
  });
  const bgNodes = await loadJSONLFile(getSignedBGraphNodesUrl);

  return [bgNodes, bgEdges];
};
