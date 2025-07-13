import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';

export class EmailAuditDocumentModel  extends BaseClass {
    body: string;
    reciepients: string;
    emailAuditId: number;
    attachments: MailAttachment[];
}
