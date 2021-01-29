import { CosmosSearchBibjsonInterface } from './typesCosmos';

/* eslint camelcase: 0 */

export interface CosmosArtifactObject {
    base_confidence: number,
    cls: string,
    content: string,
    header_content: string | null;
    postprocessing_confidence: number,
}

export interface CosmosArtifact {
    bibjson: CosmosSearchBibjsonInterface,
    license: string,
    objects: CosmosArtifactObject[],
    page: number,
    total: number,
    v: string,
}
