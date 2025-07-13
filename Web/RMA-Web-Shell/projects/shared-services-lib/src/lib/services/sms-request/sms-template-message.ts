import { SmsToken } from './sms-token';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class SmsTemplateMessage extends BaseClass {
    templateId: number;
    tokens: SmsToken[];
    smsNumbers: string[];
}
