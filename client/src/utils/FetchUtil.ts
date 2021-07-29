import { DataFile, DataSource } from '@dekkai/data-source';
import s3Client from '@/services/S3Service';

const STORE_SIZE_LIMIT = 104857600; // 100MB in bytes
const STORE_SIZE_ENTRY_LIMIT = 10485760; // 10MB in bytes
const cacheStore = new Map();
const cacheSize = new Map();
let cacheSizeTotal = 0;

const storeResult = (hash: string, result: unknown, size: number): void => {
  if (size > STORE_SIZE_ENTRY_LIMIT) {
    return;
  }

  cacheSizeTotal += size;

  while (cacheSizeTotal > STORE_SIZE_LIMIT) {
    const shiftKey = cacheStore.keys().next().value;
    cacheSizeTotal -= cacheSize.get(shiftKey);
    cacheStore.delete(shiftKey);
    cacheSize.delete(shiftKey);
  }

  cacheStore.set(hash, result);
  cacheSize.set(hash, size);
};

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
  if (cacheStore.has(hash)) {
    return Promise.resolve(cacheStore.get(hash));
  } else {
    try {
      const response = await fetch(urlStr, paramObj);
      const resultSize = (await response.clone().arrayBuffer()).byteLength;
      const result = await response.json();
      storeResult(hash, result, resultSize);
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
  const paramObjStr = JSON.stringify(paramObj);
  const hash = urlStr + paramObjStr;
  if (cacheStore.has(hash)) {
    return Promise.resolve(cacheStore.get(hash));
  } else {
    try {
      const response = await fetch(urlStr, {
        body: paramObjStr,
        method: 'POST',
      });
      const resultSize = (await response.clone().arrayBuffer()).byteLength;
      const result = await response.json();
      storeResult(hash, result, resultSize);
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
