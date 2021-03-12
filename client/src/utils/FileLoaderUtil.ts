import { DataFile } from '@dekkai/data-source';

async function parseJSONL (input: string, cb: (o: any) => void): Promise<void> {
  const file = await DataFile.fromRemoteSource(input);

  // load 2MB chunks
  const sizeOf2MB = 2 * 1024 * 1024;
  const byteLength = await file.byteLength;
  const decoder = new TextDecoder();
  const lineBreak = '\n'.charCodeAt(0);

  for (let offset = 0; offset <= byteLength; offset += sizeOf2MB) {
    const chunkEnd = Math.min(offset + sizeOf2MB, byteLength);
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

    // console.log(`${chunkEnd} / ${byteLength} - ${((chunkEnd/byteLength) * 100).toFixed(2)}%`);
  }
}

export const loadJSONLFile = async (file: string, options: any = null): Promise<any> => {
  const ret = [];

  await parseJSONL(file, json => {
    ret.push(Object.assign({}, json, options));
  });

  return ret;
};
