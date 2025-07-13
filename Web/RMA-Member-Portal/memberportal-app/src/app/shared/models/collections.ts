import { BaseClass } from 'src/app/core/models/base-class.model';
import { Invoice } from './invoice';
import { InvoiceAllocation } from './invoice-allocation';

export class Collections extends BaseClass {
    collectionsId: number;
    invoiceId: number;
    bankReference: string;
    collectionType: number;
    bankId: number;
    amount: number;
    status: number;
    Integrationstatus: number;
    invoice: Invoice;
    invoiceAllocation: InvoiceAllocation[];
}
