import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class SmsMessage extends BaseClass {
    message: string;
    clientId: string;
    smsNumbers: string[];
}
