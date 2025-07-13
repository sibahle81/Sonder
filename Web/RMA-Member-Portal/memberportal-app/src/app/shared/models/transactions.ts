import { BaseClass } from 'src/app/core/models/base-class.model';
import { Invoice } from './invoice';
import { InvoiceAllocation } from './invoice-allocation';
import { TransactionTypeLink } from './transactionTypeLink';

export class Transactions extends BaseClass {
    transactionId: number;
    invoiceId: number;
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
