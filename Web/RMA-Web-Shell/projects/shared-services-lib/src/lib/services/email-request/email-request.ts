import { MailAttachment } from './email-attachment';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class EmailRequest extends BaseClass {
        itemType: string;
        itemId: number;
        subject: String;
        fromAddress: string;
        recipients: string;
        recipientsCC: string;
        recipientsBCC: string;
        body: string;
        isHtml: boolean;
        emailId: number;
        attachments: MailAttachment[];
        createdBy: string;
        modifiedBy: string;
        isSuccess: boolean;
        processDescription: string;
        // public RMADepartmentEnum Department { get; set; }
        // public BusinessAreaEnum BusinessArea { get; set; }
        passwordHint: string;
}
