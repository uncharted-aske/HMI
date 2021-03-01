import { FacetTermsData, FacetTermsSelection, FacetTermsSubselection } from '@uncharted.software/facets-core/dist/types/facet-terms/FacetTerms';

export interface FacetTermsSubselectionMap {
  [key: string]: FacetTermsSubselection;
}

export interface FacetTermsSelectionMap {
  [key: string]: FacetTermsSelection;
}

export interface FacetTermsDataMap {
  [key: string]: FacetTermsData;
}
