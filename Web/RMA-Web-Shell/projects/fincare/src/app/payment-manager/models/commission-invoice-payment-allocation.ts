import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class CommissionInvoicePaymentAllocation extends BaseClass {
    InvoiceId: number;
    invoiceNumber: string;
    Amount: number;
    TransactionDate: number;
    IsProcessed: number;  
}