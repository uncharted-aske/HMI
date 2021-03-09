/* eslint camelcase: 0 */

export interface EmmaaModelsInterface {
  models: string[],
}

export interface EmmaaModelInfoInterface {
  description: string,
  human_readable_name: string,
  name: string,
  index: string,
  twitter?: string,
}

export interface EmmaaEvidenceMemberInterface {
    name: string,
    db_refs: {
        [key: string]: string,
    }
}

export interface EmmaaEvidenceEvidenceInterface {
  source_api: string,
  source_hash: number,
  pmid: number,
  text: string,
  text_refs: {
    [key: string]: string,
  },
  annotations: {
    found_by: string,
    agents: {
      raw_text: string[],
      raw_grounding: {
        [key: string]: string,
      }[],
    },
    prior_uuids: string[],
  }
}

export interface EmmaaEvidenceInterface {
  type: string,
  members: EmmaaEvidenceMemberInterface[],
  belief: number,
  evidence: EmmaaEvidenceEvidenceInterface[],
  id: string,
  matches_hash: string,
  supported_by: string[],
}
