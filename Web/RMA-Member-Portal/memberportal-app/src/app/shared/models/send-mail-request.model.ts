import { MailAttachment } from './email-attachment.model';


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
