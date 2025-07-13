import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';

export class EmailAudit {
  id: number;
  itemType: string;
  itemId: number | null;
  isSuccess: boolean | null;
  subject: string;
  fromAddress: string;
  reciepients: string;
  reciepientsCc: string;
  reciepientsBcc: string;
  body: string;
  isHtml: boolean | null;
  processDescription: string;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  attachments: MailAttachment[];
}
