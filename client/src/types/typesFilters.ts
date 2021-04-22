/**
 * Types related to Filters
 *
 * Filters are a mapped list of field containing multiples values.
 * Those filters follow these rules:
 *  - values within field are treated with OR,
 *  - fields are treated with AND
 *
 * Example:
 * the following filters
 *      [
 *          ['name']: { field: 'name', values: ['alfred', 'bob'] },
 *          ['city']: { field: 'city', values: ['montreal', 'toronto'] },
 *      ]
 * needs to be interpreted as
 *      (name.alfred OR name.bob) AND (city.montreal OR city.toronto)
 */

export type FilterField = string;
export type FilterValue = string | number;

export interface Filter {
  field: FilterField,
  values: FilterValue[],
}

export type Filters = Map<FilterField, Filter>;
