import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class MailAttachment extends BaseClass {
    fileName: string;
    attachmentByteData: any;
    fileType: string;
    documentUri: string;
}
