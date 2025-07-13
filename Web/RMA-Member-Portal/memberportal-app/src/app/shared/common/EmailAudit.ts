import { MailAttachment } from "../models/email-attachment.model";

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
