/** Filtres Utils */
import * as d3 from 'd3';
import { FiltreAggregate } from '@/types/typesFiltres';

// Reduce the results of a BGraph into an histogram.
export function bgraphResultsToHistogram (bgraphResult: Array<any>): FiltreAggregate[] {
  // Create a nice domain for the histogram
  const scale = d3.scaleLinear().domain(d3.extent(bgraphResult)).nice();
  const bin = d3.bin().domain(scale.domain() as [number, number]);
  return Array.from(bin(bgraphResult)).map(function (bin) {
    return {
      name: bin.x0 + '—' + bin.x1,
      value: bin.length,
    } as FiltreAggregate;
  });

  // Reduce the aggregates into an histogram of 10 bucket.
  // return bgraphResult.reduce(function (acc, value) {
  //   value = Math.floor(value * 10) / 10;
  //   if (value in acc) acc[value]++;
  //   else acc[value] = 1;
  //   return acc;
  // }, {});
}
