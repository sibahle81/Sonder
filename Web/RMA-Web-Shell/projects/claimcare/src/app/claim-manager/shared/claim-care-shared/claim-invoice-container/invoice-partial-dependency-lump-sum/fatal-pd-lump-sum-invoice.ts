import { ClaimInvoice } from "../../../entities/claim-invoice.model";

export class FatalPDLumpSumInvoice {
    claimInvoiceId: number;
    description: string;
    payeeTypeId: number;
    payee: string;
    noOfFamilyMembersBeforeDeath: number;
    noOfFamilyMembersAfterDeath: number;
    deceasedContributionToIncome: number;
    totalFamilyIncome: number;
    avgIncomePerFamilyMember: number;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    claimInvoice: ClaimInvoice;
    claimId: number;
}