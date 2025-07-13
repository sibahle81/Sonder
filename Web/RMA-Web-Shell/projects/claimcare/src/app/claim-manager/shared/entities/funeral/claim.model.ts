
import { ClaimInvoice } from '../claim-invoice.model';
import { ClaimNote } from '../claim-note';
import { ClaimCancellationReasonEnum } from 'projects/shared-models-lib/src/lib/enums/claim-cancellation-reason.enum';
import { ClaimBenefit } from '../claim-benefit';
import { ClaimRuleAudit } from '../claim-rule-audit';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { PersonEventModel } from '../personEvent/personEvent.model';

export class Claim {
    claimId: number;
    personEventId: number;
    claimReferenceNumber: string;
    claimLiabilityStatus: ClaimLiabilityStatusEnum;
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
    claimStatusId: ClaimStatusEnum;
    claimStatusChangeDate?: Date;
    claimCancellationReason: ClaimCancellationReasonEnum;
    isRuleOverridden: boolean;
    claimBenefits: ClaimBenefit[];
    claimInvoices: ClaimInvoice[];
    claimNotes: ClaimNote[];
    claimRuleAudits: ClaimRuleAudit[];
    personEvent: PersonEventModel;

    // Old fields in the database
    claimNumber: string;
    totalBenefitAmount: number | null;
    assignedToUserId: number | null;
    workPoolId: number | null;
    paymentId: number | null;
    claimantEmail: string;
    personEventDeathDate: Date;
    policyCount: number;
    underwriterId?: number;
    investigationRequired: boolean;
    pdVerified: boolean;
    disabilityPercentage: number;
    caa: number;
    familyAllowance: number;
}
