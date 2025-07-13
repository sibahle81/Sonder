import { ClaimInvoice } from "../../../entities/claim-invoice.model";

export class SundryInvoice {
    claimInvoiceId: number;
    description: string;
    payeeTypeId: number;
    payee: string;
    supplierInvoiceNo: string;
    serviceDate: Date;
    providerType: number;
    providerName: string;
    serviceType: number;
    referenceNumber: string;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    claimInvoice: ClaimInvoice;
    personEventId: number;
    payeeRolePlayerId: number;
}