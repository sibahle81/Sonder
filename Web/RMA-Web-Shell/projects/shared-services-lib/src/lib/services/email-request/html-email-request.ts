import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class HtmlEmailRequest extends BaseClass {
    subject: string;
    fromAddress: string;
    recipients: string;
    recipientsCc: string;
    recipientsBcc: string;
    body: string;
    htmlContent: string;
    action: string;
    itemId: number;
    oldItem: string;
    newItem: string;
}
