const memoizedStore = new Map();

export const getUtil = async (urlStr: string, paramObj: Record<string, any>): Promise<any> => {
  const init: RequestInit = {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
  };
  // TypeScript URL type incorrect
  // eslint-disable-next-line
  const url: any = new URL(urlStr);
  url.search = new URLSearchParams(paramObj).toString();
  try {
    const response = await fetch(url, init);
    return await response.json();
  } catch (e) {
    return e;
  }
};

export const getUtilUnsafe = async (urlStr: string): Promise<any> => {
  const init: RequestInit = {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
  };
  // TypeScript URL type incorrect
  // eslint-disable-next-line
  try {
    const response = await fetch(urlStr, init);
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

export const getUtilMemUnsafe = async (urlStr: string): Promise<any> => {
  const hash = urlStr;
  if (memoizedStore.has(hash)) {
    return Promise.resolve(memoizedStore.get(hash));
  } else {
    try {
      const result = await getUtilUnsafe(urlStr);
      memoizedStore.set(hash, result);
      return result;
    } catch (e) {
      return e;
    }
  }
};
