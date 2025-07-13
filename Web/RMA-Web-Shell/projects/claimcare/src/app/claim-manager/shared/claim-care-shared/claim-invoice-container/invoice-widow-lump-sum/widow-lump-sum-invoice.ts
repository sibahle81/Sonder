import { ClaimInvoice } from "../../../entities/claim-invoice.model";

export class WidowLumpSumInvoice {
    claimInvoiceId: number;
    description: string;
    payeeTypeId: number;
    payeeRolePlayerId: number;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    claimInvoice: ClaimInvoice;
    claimId: number;
}