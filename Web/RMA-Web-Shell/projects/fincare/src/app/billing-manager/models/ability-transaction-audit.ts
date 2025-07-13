import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class AbilityTransactionsAudit extends BaseClass {
    reference: string;
    transactionId: number;
    item: string;
    itemReference: string;
    amount: number;
    onwerDetails: string;
    bank: string;
    bankBranch: string;
    accountDetails: string;
    isProcessed: boolean;
    paymentTypeDesc: string;
    date: string;
    time: string;
    policyNumber: string;
    reportingGroup: string;
    dailyTotal: number;
}
