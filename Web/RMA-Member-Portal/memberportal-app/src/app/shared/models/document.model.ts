import { DocumentStatusEnum } from '../enums/document-status.enum';

export class Document {
  id: number;
  docTypeId: number;
  systemName: string;
  documentUri?: string;
  verifiedByDate?: Date;
  documentTypeName: string;
  verifiedBy?: string;
  fileHash?: string;
  fileName: string;
  fileExtension: string;
  documentStatus: DocumentStatusEnum;
  documentStatusText: string;
  documentSet: string;
  mimeType: string;
  documentExist: boolean;
  required: boolean;

  fileAsBase64: string;
  keys: { [key: string]: string };
  createdDate: Date;
}
