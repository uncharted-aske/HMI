
type Provenance = {
    metadataType: string,
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
    metadataType: string,
    initialConditions: Record<number, string>[],
    parameters: Record<number, string>[],
    variables: Record<number, string>[],
    provenance: Provenance,
}

export interface CodeCollectionInterface {
    uid: string,
    provenance: Provenance,
    metadataType: string,
    globalReferenceId: {id: string, type: string},
    fileIds: FileId[],
}

export interface TextualDocumentReferenceSet {
    uid: string,
    provenance: Provenance,
    metadataType: string,
    documents: any,
}
