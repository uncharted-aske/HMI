import { DataFile, DataSource } from '@dekkai/data-source';
import s3Client from '@/services/S3Service';

const memoizedStore = new Map();

export const getUtil = async (urlStr: string, paramObj?: Record<string, any>): Promise<any> => {
  const init: RequestInit = {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
  };

  const url = new URL(urlStr);
  url.search = new URLSearchParams(paramObj).toString();
  try {
    const response = await fetch(url as unknown as Request, init);
    return await response.json();
  } catch (e) {
    return e;
  }
};

export const getUtilMem = async (urlStr: string, paramObj: Record<string, any>): Promise<any> => {
  const hash = urlStr + JSON.stringify(paramObj);
  if (memoizedStore.has(hash)) {
    return Promise.resolve(memoizedStore.get(hash));
  } else {
    try {
      const result = await getUtil(urlStr, paramObj as URLSearchParams);
      memoizedStore.set(hash, result);
      return result;
    } catch (e) {
      return e;
    }
  }
};

export const postUtil = async (urlStr: string, paramObj: Record<string, any>): Promise<any> => {
  try {
    const response = await fetch(urlStr, {
      body: JSON.stringify(paramObj),
      method: 'POST',
    });
    return await response.json();
  } catch (e) {
    return e;
  }
};

export const postUtilMem = async (urlStr: string, paramObj: Record<string, any>): Promise<any> => {
  const hash = urlStr + JSON.stringify(paramObj);
  if (memoizedStore.has(hash)) {
    return Promise.resolve(memoizedStore.get(hash));
  } else {
    try {
      const result = await postUtil(urlStr, paramObj as URLSearchParams);
      memoizedStore.set(hash, result);
      return result;
    } catch (e) {
      return e;
    }
  }
};

// TODO: @dekkai/data-source is unable to properly stream in gzipped files so we
// are using a workaround by fetching a blob until the following issue is fixed:
// https://github.com/dekkai-data/data-source/issues/1
export const getS3Util = (s3PathUrl: string): Promise<DataSource> => {
  let signedBGraphNodesUrl;
  if (process.env.NODE_ENV === 'development') {
    // In development connect directly with S3
    signedBGraphNodesUrl = s3Client.getSignedUrl('getObject', {
      Bucket: process.env.S3_BUCKET,
      Key: s3PathUrl,
    });
  } else {
    // In production connect to S3 through proxy API to avoid exposing secrets
    signedBGraphNodesUrl = `/services/s3/${s3PathUrl}`;
  }

  return fetch(signedBGraphNodesUrl)
    .then(rawData => rawData.blob())
    .then(bgNodesBlob => DataFile.fromLocalSource(bgNodesBlob));
};
