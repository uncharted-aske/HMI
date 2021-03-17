import { DataFile } from '@dekkai/data-source';

const SIZE_OF_2MB = 2 * 1024 * 1024;

async function parseJSONL (input: string, cb: (obj: any) => void): Promise<void> {
  const file = await DataFile.fromRemoteSource(input);

  const chunkSizeInBytes = SIZE_OF_2MB;
  const byteLength = await file.byteLength;
  const decoder = new TextDecoder();
  const lineBreak = '\n'.charCodeAt(0);

  for (let offset = 0; offset <= byteLength; offset += chunkSizeInBytes) {
    const chunkEnd = Math.min(offset + chunkSizeInBytes, byteLength);
    const chunk = await file.loadData(offset, chunkEnd);
    const view = new DataView(chunk);
    let start = 0;
    for (let i = 0, n = chunk.byteLength; i < n; ++i) {
      if (view.getUint8(i) === lineBreak || offset + i === byteLength) {
        const statementBuffer = new Uint8Array(chunk, start, i - start);
        start = i + 1;

        const str = decoder.decode(statementBuffer);
        const json = JSON.parse(str);

        cb(json);
      }
    }

    if (start < chunk.byteLength) {
      offset -= chunk.byteLength - start;
    }
  }
}

export const loadJSONLFile = async (file: string, options: any = null): Promise<any[]> => {
  const parsedJSONL = [];

  await parseJSONL(file, json => {
    parsedJSONL.push(Object.assign({}, json, options));
  });

  return parsedJSONL;
};
