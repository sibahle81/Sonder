import { BaseClass } from 'src/app/core/models/base-class.model';
import { Collections } from './collections';
import { InvoiceLineItems } from './invoice-line-items';
import { Transactions } from './transactions';


export class Invoice extends BaseClass {
    invoiceId: number;
    policyId: number;
    collectionDate: Date;
    totalInvoiceAmount: number;
    status: number;
    invoiceNumber: string;
    invoiceDate: Date;
    collections: Collections[];
    invoiceLineItems: InvoiceLineItems[];
    transactions: Transactions[];
}
