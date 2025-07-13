import { DocumentSetEnum } from "projects/shared-models-lib/src/lib/enums/document-set.enum";
import { DocumentTypeEnum } from "projects/shared-models-lib/src/lib/enums/document-type.enum";

export class ClaimDocumentRequest {
    requestText: string;
    documentSet: DocumentSetEnum;
    documentTypeFilter: DocumentTypeEnum[];
    forceRequiredDocumentTypeFilter: DocumentTypeEnum[];
    keyName: string;
    keyValue: string;
    requestedBy: string;
    requestedDate: Date;
    personEventId: number;
}
