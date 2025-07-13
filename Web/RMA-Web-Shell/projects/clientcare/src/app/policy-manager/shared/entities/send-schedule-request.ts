import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class SendScheduleRequest extends BaseClass {
    data: any;
    customEmailAddress: string;
    documentName : string;
    policyId: number;
    isSendClient: boolean;
}
