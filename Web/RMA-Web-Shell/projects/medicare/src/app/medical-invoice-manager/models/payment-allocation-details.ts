import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class PaymentAllocationDetails extends BaseClass {
    allocationId: number;
    invoiceType: string;
    totalAmount: number;
    payeeId: number;
    payeeName: string;
    payeeType: string;
    allocationStatusId: number;
    allocationStatus: string;
    medicalInvoiceId: number;
    assessedAmount: number;
    assessedVat: number;
}