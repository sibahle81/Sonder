import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class PolicyScheduleRequest extends BaseClass {
    policyId: number;
    customEmailAddress: string;
    isSendClient : boolean;
}
