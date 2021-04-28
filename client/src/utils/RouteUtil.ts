/**
 * List of tools to manipulate the Route.
 */

import { Location } from 'vue-router';
import Router from '@/router';
import { Filtres } from '@/types/typesFiltres';

/** Remove the filtres from the Route */
function clearFiltres (): void {
  const query = { filtres: null };
  Router.getRouter().push({ query } as Location);
}

/** Fetch the filtres from the Route  */
function getFiltres (): Filtres {
  return Router?.query?.filtres;
}

/** Update the filtres in the Route */
function updateFiltres (filtres: Filtres): void {
  const filtresInJSON = JSON.stringify(Array.from(filtres.values()));
  const query = { filtres: filtresInJSON };
  Router.getRouter().push({ query } as Location);
}

export {
  clearFiltres,
  getFiltres,
  updateFiltres,
};
