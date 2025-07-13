import { DebtorStatusEnum } from "../../shared/enum/debtor-status.enum";

export class LegalHandOverDetail {
    legalHandOverFileDetailId: number;
    debtorNumber: string;
    customerName: string;
    industryClass: string;
    agent: string;
    openingBalance: string;
    currentBalance: string;
    currentStatus: string;
    accountAge: string;
   oneFollowUpDate: string;
    twoFollowUpDate: string;
    agentStatus: string;
    comment: string;
    lastChangedDate: string;
    contactNumber: string;
    emailAddress: string;
    legalHandOverFileId: number;
    periodId?: number;
    debtorStatus: DebtorStatusEnum;
}