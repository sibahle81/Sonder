import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';

export class ClaimsRecoveryModel {
    claimRecoveryId: number;
    claimId: number;
    claimStatus: ClaimStatusEnum;
    rolePlayerId: number;
    rolePlayerBankingId: number;
    recoveryAmount: number;
    recoveredAmount: number;
    invoiceId: number;
    transactionId: number;
    finPayeeNumber: string;
    recoveryInvokedBy: string;
    createdDate: string;
    createdBy: string;

    name: string;
    claimNumber: number;
    idNumber: string;
    claimStatusDisplayName: string;
    claimStatusDisplayDescription: string;
}
