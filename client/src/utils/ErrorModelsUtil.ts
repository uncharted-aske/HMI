export const L2Norm = (x: number[]): number => {
  // See: https://mathworld.wolfram.com/L2-Norm.html
  return Math.sqrt(x.reduce((acc, val) => {
    return acc + Math.abs(val) ** 2;
  }, 0));
};
