import { PaymentMethodEnum } from 'projects/shared-models-lib/src/lib/enums/payment-method-enum';

export class InvoiceAllocation
{
    invoiceAllocationId: Number; 
    claimInvoiceId: Number; 
    beneificaryRolePlayerId: Number; 
    assessedAmount: Number; 
    assessedVat: Number; 
    paymentMethod: PaymentMethodEnum | null; 
    percentAllocation: Number;
    allocationGroup: Number; 
    invoiceAllocationStatusId: Number; 
    invoiceTypeId: Number;
    isDeleted: Boolean; 
    createdBy: String; 
    createdDate: Date ;
    modifiedBy: String; 
    modifiedDate: Date;
    rolePlayerBankingId: number;
}