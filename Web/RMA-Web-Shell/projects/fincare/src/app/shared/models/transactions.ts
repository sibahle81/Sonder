import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { Invoice } from './invoice';
import { InvoiceAllocation } from './invoice-allocation';
import { TransactionTypeLink } from './transaction-type-link';

export class Transactions extends BaseClass {
    transactionId: number;
    invoiceId: number;
    rolePlayerId: number;
    transactionTypeLinkId: number;
    amount: number;
    transactionDate: Date;
    bankReference: string;
    transactionTypeId: number;
    invoiceDate: Date;
    invoiceAllocations: InvoiceAllocation[];
    invoice: Invoice;
    transactionTypeLink: TransactionTypeLink;
}
