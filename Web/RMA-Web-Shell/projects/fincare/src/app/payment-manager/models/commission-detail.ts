import { CommissionInvoicePaymentAllocation } from './commission-invoice-payment-allocation';

export class CommissionDetail {
    detailId: number;
    commissionFormula: string;
    invoicePaymentAllocationId: number;
    invoiceNumber: string;
    policyNumber: string;
    repCode: string;
    repName: string;
    allocatedAmount: number;
    headerId: number;
    commissionPercentage: number;
    adminPercentage: number;
    commissionAmount: number;
    adminServiceFeeAmount: number;
    totalAmount: number;
    adminServiceFeeFormula: string;
    invoicePaymentAllocation:CommissionInvoicePaymentAllocation
}