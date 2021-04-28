/**
 * Types related to Filtres
 *
 * Filtres are a mapped list of field containing multiples values.
 * Those filtres follow these rules:
 *  - values within field are treated with OR,
 *  - fields are treated with AND
 *
 * Example:
 * the following filtres
 *      [
 *          ['name']: { field: 'name', values: ['alfred', 'bob'] },
 *          ['city']: { field: 'city', values: ['montréal', 'toronto'] },
 *      ]
 * needs to be interpreted as
 *      (name.alfred OR name.bob) AND (city.montréal OR city.toronto)
 */

/* Define the aggregation result for a field possible value */
export type FiltreAggregate = {
  value: string | number,
  aggregate: number,
};

/* The name of a field */
export type FiltreField = string;

/* Type of field */
export type FiltreType = 'categorical' | 'histogram' | 'datetime';

/* The value of a field */
export type FiltreValue = string | number;

export type Filtre = {
  field: FiltreField,
  type: FiltreType,
  values: FiltreValue[],
  aggregates: FiltreAggregate[],
}

export type Filtres = Map<FiltreField, Filtre>;
