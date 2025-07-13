// import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
// import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
// import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';

import { DocumentSetEnum } from "../enums/document-set.enum";
import { DocumentStatusEnum } from "../enums/document-status-enum";
import { DocumentTypeEnum } from "../enums/document-type.enum";

export class GenericDocument {
  id: number;
  keyName: string;
  keyValue: string;
  systemName: string;
  documentSet: DocumentSetEnum;
  documentType: DocumentTypeEnum;
  required: boolean;
  fileName: string;
  fileExtension: string;
  documentDescription: string;
  documentStatus: DocumentStatusEnum;
  documentUri: string;
  isMemberVisible: boolean;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;

  fileAsBase64: string;
}
