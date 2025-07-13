import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class AbilityPostingAudit extends BaseClass {
    reference: string;
    paymentId: number;
    sysNo: number;
    paymentHeaderDetailId: number;
    paymentReference: string;
    paymentBatchReference: string;
    amount: number;
    payeeDetails: string;
    bank: string;
    bankBranch: string;
    accountDetails: string;
    paymentType: number;
    paymentTypeDesc: string;
    date: string;
    time: string;
    policyNumber:string;
    benefitCode:string;
}
