import s3Client from '@/s3';
import { loadJSONLFile } from '@/utils/FileLoaderUtil';

// FIXME: Fix return type once bgraph library types are added
export const loadBGraphData = async (): Promise<any[]> => {
  const getSignedBGraphEdgesUrl = s3Client.getSignedUrl('getObject', {
    Bucket: 'aske',
    Key: 'research/BIO/dist/v3.4/bgraph/bgedges.jsonl',
  });
  const bgEdges = await loadJSONLFile(getSignedBGraphEdgesUrl);

  const getSignedBGraphNodesUrl = s3Client.getSignedUrl('getObject', {
    Bucket: 'aske',
    Key: 'research/BIO/dist/v3.4/bgraph/bgnodes.jsonl',
  });
  const bgNodes = await loadJSONLFile(getSignedBGraphNodesUrl);

  return [bgNodes, bgEdges];
};
