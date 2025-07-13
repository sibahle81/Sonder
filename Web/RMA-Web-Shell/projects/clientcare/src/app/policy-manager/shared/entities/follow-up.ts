import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class FollowUp extends BaseClass {
    recipientTypeId: number;
    itemId: number;
    itemType: string;
    userId: number;
    policyId: number;
    name: string;
    email: string;
    description: string;
    alertDate: Date;
    alertTime: Date;
    minutes: number;
    hours: number;
    reference: string;
}
