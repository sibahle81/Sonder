import { ClaimCancellationReasonEnum } from "../enums/claim-cancellation-reason.enum";
import { ClaimStatusEnum } from "../enums/claim-status.enum";
import { ClaimBenefit } from "./claim-benefit";
import { ClaimInvoice } from "./Claim-invoice.model";
import { ClaimNote } from "./claim-note";
import { ClaimRuleAudit } from "./claim-rule-audit";
import { PersonEvent } from "./person-event";



export class Claim {
    claimId: number;
    personEventId: number;
    claimReferenceNumber: string;
    claimLiabilityStatusId: number;
    isCancelled: boolean;
    isClosed: boolean;
    claimClosedReasonId: number | null;
    policyId: number;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    wizardId: number;

    claimStatus: ClaimStatusEnum;
    claimStatusChangeDate?: Date;
    claimCancellationReason: ClaimCancellationReasonEnum;
    isRuleOverridden: boolean;
    claimBenefits: ClaimBenefit[];
    claimInvoices: ClaimInvoice[];
    claimNotes: ClaimNote[];
    claimRuleAudits: ClaimRuleAudit[];
    personEvent: PersonEvent;

    // Old fields in the database
    claimNumber: string;
    totalBenefitAmount: number | null;
    assignedToUserId: number | null;
    workPoolId: number | null;
    paymentId: number | null;
    claimantEmail: string;
    personEventDeathDate: Date;
    policyCount: number;

}
