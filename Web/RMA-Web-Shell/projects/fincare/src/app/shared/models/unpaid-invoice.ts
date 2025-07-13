import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';


export class UnpaidInvoice extends BaseClass {
    controlNumber: string;
    controlName: string;
    year: number;
    period: number;
    accountNumber: string;
    debtorName: string;
    invoiceId: number;
    invoiceNumber: string;
    policyId: number;
    policyNumber: string;
    collectionDate: Date;
    totalInvoiceAmount: number;
    status: number;
    invoiceDate: Date;
    underwritingYear: string;
    notificationDate: Date;
    collectionDays: number;
    daysSinceInvoice: number;
    invoiceBalance: number
}