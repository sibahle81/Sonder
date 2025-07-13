import { InvoiceTypeEnum } from "projects/shared-models-lib/src/lib/enums/invoice-type-enum";
import { ClaimInvoice } from "../../../entities/claim-invoice.model";

export class FuneralExpenseInvoice {
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
    invoiceType : InvoiceTypeEnum;
}