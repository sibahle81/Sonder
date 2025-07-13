import { ClaimRecoveryReasonEnum } from 'projects/shared-models-lib/src/lib/enums/claim-recovery-reason-enum';
import { ClaimNote } from 'projects/claimcare/src/app/claim-manager/shared/entities/claim-note';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

export class ClaimantRecoveryModel {
  rolePlayer: RolePlayer;
  recoveryReason: ClaimRecoveryReasonEnum;
  recoveryAmount: number;
  paymentPlan: string;
  paymentDay: number;
  claimId: number;
  documentSetEnum: any;
  personEventReferenceNumber: any;
  personEventId: number;
}
