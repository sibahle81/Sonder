import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class AbilityCollectionsAudit extends BaseClass{
    reference: string;
    invoiceId: number;
    batchReference: string;
    amount: number;
    ownerDetails: string;
    bank: string;
    bankBranch: string;
    accountDetails: string;
    isProcessed: boolean;
    paymentTypeDesc: string;
    date: string;
    time: string;
    policyNumber: string;
  }