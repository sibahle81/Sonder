import { BaseClass } from 'src/app/core/models/base-class.model';
import { Invoice } from './invoice';

export class InvoiceLineItems extends BaseClass {
    invoiceLineItemsId: number;
    invoiceId: number;
    amount: number;
    invoice: Invoice;
}
