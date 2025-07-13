import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ClaimInvoice } from '../../../claim-manager/shared/entities/claim-invoice.model';

export interface ClaimRecoveryView {
    eventDescription: string;
    deceased: RolePlayer;
    recoveryRolePlayer: RolePlayer;
    insuredDeathDate: Date;
    claimNumber: number;
    claimReferenceNumber: string;
    claimCreatedDate: Date;
    claimInvoice: ClaimInvoice;
    claimId: number;
}
