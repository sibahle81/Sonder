import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class Token extends BaseClass {
    emailId: number;
    smsId: number;
    tokenKey: string;
    tokenValue: string;
}
