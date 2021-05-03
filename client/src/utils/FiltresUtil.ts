/** Filtres Utils */
import * as d3 from 'd3';
import { FiltreAggregate } from '@/types/typesFiltres';
import { FacetBarsBaseData } from '@uncharted.software/facets-core/dist/types/facet-bars-base/FacetBarsBase';
import { FacetBarsValueData } from '@uncharted.software/facets-core/dist/types/facet-bars-value/FacetBarsValue';

/* ---- BGraph to Filtres Utils ---- */

// Reduce the results of a BGraph into an histogram.
export function bgraphResultsToHistogram (bgraphResult: Array<any>): FiltreAggregate[] {
  const NB_BINS = 10;
  // Create a nice domain for the histogram
  const scale = d3.scaleLinear()
    .domain(d3.extent(bgraphResult))
    .nice();
  const bin = d3.bin()
    .domain(scale.domain() as [number, number])
    .thresholds(scale.ticks(NB_BINS));

  return Array.from(bin(bgraphResult))
    .map(function (bin) {
      return {
        name: bin.x1,
        value: bin.length,
      } as FiltreAggregate;
    });
}

/* ---- Filtres to Facets Utils---- */

/** Transforma a Filtre aggregates into data for Facets Bars. */
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
