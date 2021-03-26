import s3Client from '@/services/S3Service';
import { loadJSONLFile } from '@/utils/FileLoaderUtil';
import { DataFile } from '@dekkai/data-source';

// FIXME: Fix return type once bgraph library types are added
export const loadBGraphData = async (): Promise<any[]> => {
  const getSignedBGraphEdgesUrl = s3Client.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET,
    Key: process.env.S3_BGRAPH_EDGES_KEY,
  });
  // TODO: @dekkai/data-source is unable to properly stream in gzipped files so we
  // are using a workaround by fetching a blob until the following issue is fixed:
  // https://github.com/dekkai-data/data-source/issues/1
  const bgEdgesBlob = await (await fetch(getSignedBGraphEdgesUrl)).blob();
  const bgEdges = await loadJSONLFile(await DataFile.fromLocalSource(bgEdgesBlob));

  const getSignedBGraphNodesUrl = s3Client.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET,
    Key: process.env.S3_BGRAPH_NODES_KEY,
  });
  // TODO: @dekkai/data-source is unable to properly stream in gzipped files so we
  // are using a workaround by fetching a blob until the following issue is fixed:
  // https://github.com/dekkai-data/data-source/issues/1
  const bgNodesBlob = await (await fetch(getSignedBGraphNodesUrl)).blob();
  const bgNodes = await loadJSONLFile(await DataFile.fromLocalSource(bgNodesBlob));

  return [bgNodes, bgEdges];
};
