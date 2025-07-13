import { DocumentSetEnum } from "../enums/document-set.enum";

export interface DocumentSetDocumentType {
    id: number;
    docTypeId: number;
    documentSet: DocumentSetEnum;
    required: boolean;
    statusEnabled: boolean;
    templateAvailable: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    documentTypeName: string;
}