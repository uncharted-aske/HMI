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
 *          ['city']: { field: 'city', values: ['montreal', 'toronto'] },
 *      ]
 * needs to be interpreted as
 *      (name.alfred OR name.bob) AND (city.montreal OR city.toronto)
 */

export type FiltreField = string;
export type FiltreValue = string | number;

export interface Filtre {
  field: FiltreField,
  values: FiltreValue[],
}

export type Filtres = Map<FiltreField, Filtre>;
