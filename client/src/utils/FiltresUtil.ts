/** Filtres Utils */
import * as d3 from 'd3';
import { FiltreAggregate } from '@/types/typesFiltres';
import { FacetBarsBaseData } from '@uncharted.software/facets-core/dist/types/facet-bars-base/FacetBarsBase';
import { FacetBarsValueData } from '@uncharted.software/facets-core/dist/types/facet-bars-value/FacetBarsValue';

/* ---- BGraph to Filtres Utils ---- */

/** Reduce the results of a BGraph into an histogram. */
export function bgraphResultsToHistogram (bgraphResult: Array<any>): FiltreAggregate[] {
  const NB_BINS = 10;
  // Create a nice domain for the histogram
  const scale = d3.scaleLinear()
    .domain(d3.extent(bgraphResult))
    .nice();
  const bins = d3.bin()
    .domain(scale.domain() as [number, number])
    .thresholds(scale.ticks(NB_BINS))(bgraphResult);

  // The last bin produced by D3 has a width of 0, as opposed to all the other bins which have a
  // width equivalent to the bin interval (binMax - binMin), with a value equal to the max bin range.
  // This results in errors at the histogram rendering level and the selected bin to selected range
  // translation level, due to this 0 width bin being treated the same way as the interval width bins.
  // To correct, combine the two last bins by adding the results of the last bin (with bin width of 0)
  // to the results of the second last bin. Throw away the empty last bin when rendering.
  for (let i = bins[bins.length - 1].length; i >= 0; i--) {
    bins[bins.length - 2].push(bins[bins.length - 1].pop());
  }

  return Array.from(bins)
    .map(function (bin) {
      return {
        name: bin.x0.toString(), // display the lower limit of the bin
        value: bin.length,
      } as FiltreAggregate;
    });
}

/* ---- Filtres to Facets Utils---- */

/** Transform a Filtre aggregates into data for Facets Bars. */
export function aggregatesToFacetsBars (aggregates: FiltreAggregate[]): FacetBarsBaseData {
  const data: FacetBarsBaseData = [];
  if (aggregates) {
    const max = aggregates.reduce((a, b) => a.value > b.value ? a : b).value;
    aggregates.forEach(function (aggregate, index) {
      data[index] = {
        ratio: aggregate.value / max,
        label: aggregate.name,
        // metadata?: any;
      } as FacetBarsValueData;
    });
  }
  return data;
}
