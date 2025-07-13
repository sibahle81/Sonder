import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class TargetAudience extends BaseClass {
    campaignId: number;
    policyId: number;
    policyNo: string;
    clientTypeId: number;
    itemType: string;
    itemId: number;
    name: string;
    email: string;
    memberNumber: string;
    idNumber: string;
    mobileNumber: string;
    postalAddress: string;
    unsubscribed: boolean;
    unsubscribedAll: boolean;
}
