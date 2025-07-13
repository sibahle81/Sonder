import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { Invoice } from './invoice';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';

export class InvoiceLineItems extends BaseClass {
    invoiceLineItemsId: number;
    invoiceId: number;
    amount: number;
    invoice: Invoice;
    policyId: number;
    policyStatus: PolicyStatusEnum;
    isExcludedDueToStatus: boolean;
    insurableItem: string;
    noOfEmployees: number;
    earnings: number;
    rate: number;
    premiumPayable: number;
    percentage: number;
    paymentAmount: number;
    actualPremium: number;
    coverStartDate: Date;
    coverEndDate: Date;

    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}
