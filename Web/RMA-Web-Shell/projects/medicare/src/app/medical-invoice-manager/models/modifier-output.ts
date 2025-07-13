import { InvoiceLineDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-details';

export class ModifierOutput{
    modifierCode: string;
    modifierDescription: string;
    modifierServiceDate: Date;
    modifierQuantity: number;
    modifierAmount: number;
    totalIncusiveAmount: number;
    modifiedInvoiceLines: InvoiceLineDetails[];
}