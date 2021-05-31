/**
 * Types related to Filtres
 *
 * Filtres are a mapped list of field containing multiples clauses.
 * Those filtres follow these rules:
 *  - clauses within field are treated with OR,
 *  - fields are treated with AND
 *
 * Example:
 * the following filtres
 *      [
 *          ['name']: { field: 'name', clauses: ['alfred', 'bob'] },
 *          ['city']: { field: 'city', clauses: ['montréal', 'toronto'] },
 *      ]
 * needs to be interpreted as
 *      (name.alfred OR name.bob) AND (city.montréal OR city.toronto)
 */

export type FiltreAggregate = {
  name: string | number,
  value: number,
};

export type FiltreClause = string | number;

export type FilterGraphType = 'edge' | 'node';

export type FiltreField = string;

export type FiltreType = 'categorical' | 'histogram' | 'datetime';

export type Filtre = {
  aggregates?: FiltreAggregate[],
  clauses: FiltreClause[],
  field: FiltreField,
}

export type Filtres = Filtre[];

/** List of ALL Filtres fields name */
export enum FILTRES_FIELDS {
  BELIEF_SCORE = 'belief',
}

/** List of ALL filtres fields properties needed:
 *   - for display (Facets, LexBar, etc.)
 *   - or Querying (BGraph).
 */
export const FILTRES = {
  [FILTRES_FIELDS.BELIEF_SCORE]: {
    displayName: 'Belief Score (0—1)',
    name: 'belief',
    graphType: 'edge',
    type: 'histogram',
  },
} as {
  [key: string]: {
    displayName: string,
    name: string,
    graphType: FilterGraphType,
    type: FiltreType,
  }
};
