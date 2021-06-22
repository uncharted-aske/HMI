
type Provenance = {
    metadata_type: string,
    method: string,
    timestamp: Date,
};

type FileId = {
    name: string,
    path: string,
    uid: string,
}

export interface ModelInterface {
    uid: string,
    metadata_type: string,
    initial_conditions: Record<number, string>[],
    parameters: Record<number, string>[],
    variables: Record<number, string>[], 
    provenance: Provenance,
}

export interface CodeCollectionInterface {
    uid: string,
    provenance: Provenance,
    metadata_type: string,
    global_reference_id: {id: string, type: string},
    file_ids: FileId[],
}

export interface TextualDocumentReferenceSet {
    uid: string,
    provenance: Provenance,
    metadata_type: string,
    documents: any,
}