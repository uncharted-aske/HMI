const memoizedStore = new Map();

export const getUtil = async (urlStr: string, paramObj: Record<string, any>): Promise<any> => {
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
