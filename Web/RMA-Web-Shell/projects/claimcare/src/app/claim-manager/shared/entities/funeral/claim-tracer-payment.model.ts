
export class ClaimTracerPaymentModel {
    tracerInvoiceId : number;
    claimId : number;
    rolePlayerId : number;
    tracingFee : number;
    paymentStatusId : number;
    reason: string;
    payDate: Date;
    claimInvoiceType: number;
    invoiceDate: Date;
    capturedDate: Date;
    productId: number;
    bankAccountId: number;
    tracerEmail: string;
}

