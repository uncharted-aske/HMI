const fixFloatingPoint = (val:number):number => Number.parseFloat(val.toPrecision(15));

export const binIntervalFromData = (binNum: number, binMax: number, binMin: number):number => {
  return fixFloatingPoint(fixFloatingPoint(binMax - binMin) / binNum);
};

export const binFromValue = (
  args: {value:number, binInterval:number, binMax:number, binMin:number},
): number => {
  const { value, binInterval, binMax, binMin } = args;

  let binNumber = Math.floor(fixFloatingPoint(fixFloatingPoint(value - binMin) / binInterval));

  // last bin includes both the last bin range + the max bin value
  if (value === binMax) {
    binNumber--;
  }

  return binNumber;
};

export const binFromValueMap = (args: {
  valueArr:Array<number>,
  binInterval:number,
  binMax:number,
  binMin:number
}): Array<number> =>
  args.valueArr.map(value =>
    binFromValue({
      binInterval: args.binInterval,
      binMax: args.binMax,
      binMin: args.binMin,
      value,
    }),
  );

export const valuesFromBin = (
  args: {bin: number, binInterval:number, binMin:number},
): number => {
  const { bin, binInterval, binMin } = args;
  return fixFloatingPoint(binMin + fixFloatingPoint(bin * binInterval));
};

export const valuesFromBinMap = (
  args: {binArr: Array<number>, binInterval:number, binMin:number},
): Array<number> =>
  args.binArr.map(bin =>
    valuesFromBin({
      binInterval: args.binInterval,
      binMin: args.binMin,
      bin,
    }),
  );
