import { BaseClass } from '../../core/models/base-class.model';

export class MailAttachment extends BaseClass {
    fileName: string;
    attachmentByteData: any;
    fileType: string;
}
