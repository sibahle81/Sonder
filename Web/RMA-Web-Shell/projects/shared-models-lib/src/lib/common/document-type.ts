import { DocumentSetDocumentType } from './document-set-document-type';

export class DocumentType {
    id: number;
    name: string;
    validDays: string;
    createdBy: string;
    createdDate: Date | string;
    modifiedBy: string;
    modifiedDate: Date | string;
    manager: string; // Manager (length: 255)

    documents: Document[];
    documentSetDocumentTypes: DocumentSetDocumentType[];
}
