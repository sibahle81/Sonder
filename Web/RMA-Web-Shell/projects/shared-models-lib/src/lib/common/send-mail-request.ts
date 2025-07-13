import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';

export class SendMailRequest {
  itemType: string;
  itemId: number;
  subject: string ;
  fromAddress: string ;
  recipients: string;
  recipientsCC: string;
  recipientsBCC: string ;
  body: string;
  isHtml: boolean ;
  emailId?: number;
  attachments: MailAttachment[];
  createdBy: string ;
  modifiedBy: string ;
  isSuccess?: boolean;
}
