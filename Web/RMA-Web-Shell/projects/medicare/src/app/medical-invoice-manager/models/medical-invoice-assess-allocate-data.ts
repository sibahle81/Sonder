import { InvoiceAllocation } from 'projects/claimcare/src/app/claim-manager/shared/entities/invoice-allocation.model';
import { Invoice } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice';
import { InvoiceDetails } from './medical-invoice-details';
import { TebaInvoice } from './teba-invoice';
import { MedicalInvoicePaymentAllocation } from './medical-invoice-payment-allocation';

export class InvoiceAssessAllocateData {
    invoiceDetail: InvoiceDetails;
    tebaInvoice: TebaInvoice;
    InvoiceAllocation: MedicalInvoicePaymentAllocation;
}
