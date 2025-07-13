import { DocumentTypeEnum } from "projects/shared-models-lib/src/lib/enums/document-type.enum";

export class ClaimAdditionalRequiredDocument {
  id: number;
  personeventId: number;
  documentId: number;
  isUploaded: boolean;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  documentGroupId: number;
  documentName: string;
  visibleToMember: boolean;
  requestNote: string;
}
