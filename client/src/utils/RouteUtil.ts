/**
 * List of tools to manipulate the Route.
 */

import { Location } from 'vue-router';
import Router from '@/router';
import { Filters } from '@/types/typesFilters';

/** Remove the filters from the Route */
function clearFilters (): void {
  const query = { filters: null };
  Router.getRouter().push({ query } as Location);
}

/** Fetch the filters from the Route  */
function getFilters (): Filters {
  return Router?.query?.filters;
}

/** Update the filters in the Route */
function updateFilters (filters: Filters): void {
  const filtersInJSON = JSON.stringify(Array.from(filters.values()));
  const query = { filters: filtersInJSON };
  Router.getRouter().push({ query } as Location);
}

export {
  clearFilters,
  getFilters,
  updateFilters,
};
