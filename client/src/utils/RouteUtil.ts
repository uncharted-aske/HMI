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
  const filtresJSON = Router?.query?.filtres;
  if (filtresJSON) {
    return JSON.parse(Router?.query?.filtres);
  }
}

/** Update the filtres in the Route */
function updateFiltres (filtres: Filtres): void {
  const filtresWithoutAggregates = Array.from(filtres.values()).map(filtre => {
    const { field, clauses } = filtre;
    return { field, clauses };
  });
  const filtresJSON = JSON.stringify(filtresWithoutAggregates);
  if (Router?.query?.filtres !== filtresJSON) {
    const query = { filtres: filtresJSON };
    Router.getRouter().push({ query } as Location)
      .catch(e => console.debug(e)); // eslint-disable-line no-console
  }
}

export {
  clearFiltres,
  getFiltres,
  updateFiltres,
};
