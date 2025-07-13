import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class SearchResultModel extends BaseClass {
    policyId: number;
    productName: string;
    claimReferenceNumber: string;
    status: string;
    statusReason: string;
    memberFirstName: string;
    memberLastName: string;
    memberRole: string;
    industryNumber: string;
    employeeNumber: string;
    wizardId: number;
    isRuleOverridden?: boolean;
    dateOfBirth: Date;
    idNumber: string;
    insuredLifeId: number;
}
