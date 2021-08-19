export const linearInterpolation = (xInterp: number, x: number[], y: number[]): [number, number] => {
  // See: https://en.wikipedia.org/wiki/Linear_interpolation
  const len = x.length;
  if (xInterp < x[0]) {
    return [y[0] + (xInterp - x[0]) * ((y[1] - y[0]) / (x[1] - x[0])), -1];
  } else if (xInterp > x[len - 1]) {
    return [y[len - 1] + (xInterp - x[len - 1]) * ((y[len - 1] - y[len - 2]) / (x[len - 1] - x[len - 2])), len - 1];
  }
  let i = 0;
  while (i < x.length) {
    if (x[i] === xInterp) {
      return [y[i], i];
    }
    if (x[i] <= xInterp && xInterp < x[i + 1]) {
      return [y[i] + (xInterp - x[i]) * ((y[i + 1] - y[i]) / (x[i + 1] - x[i])), i];
    }
    i++;
  }
};

// Utility function to linearly interpolate a set of points
// NOTE: All arrays are assumed to be sorted in ascending order
export const linearInterpolations = (xInterps: number[], x: number[], y: number[]): void => {
  let i = 0;
  while (i < xInterps.length) {
    // TODO: Searching for the index to interpolate within each loop is highly inefficient
    // however it is conceptually easier to understand
    const [yInterp, interpIdx] = linearInterpolation(xInterps[i], x, y);
    if (x[interpIdx] !== xInterps[i]) {
      x.splice(interpIdx + 1, 0, xInterps[i]);
      y.splice(interpIdx + 1, 0, yInterp);
    }
    i++;
  }
};
