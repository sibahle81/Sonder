import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { RefundTypeEnum } from '../../shared/enum/refund-type.enum';
import { RefundReasonEnum } from '../../shared/enum/refund-reason.enum';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { RefundTransaction } from './refund-transactions';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { refundRmaBankAccountAmount } from './refundRmaBankAccountAmounts';

export class Refund {
  refundAmount: number;
  refundDate: Date;
  note: Note;
  trigger: RefundTypeEnum;
  refundReason: RefundReasonEnum;
  transactionIds: number[];
  rolePlayerId: number;
  rolePlayerName: string;
  requestCode: string;
  finPayeNumber: string;
  periodStatus: PeriodStatusEnum;
  partialRefundTransactions: RefundTransaction[];
  refundBankAccountNumber: string;
  refundBankBranchCode: string;
  groupEmail: string;
  clientEmail: string;
  tempDocumentKeyValue: string;
  rolePlayerBankingId: number;
  overrideMembershipApprover :boolean;
  refundRmaBankAccountAmounts: refundRmaBankAccountAmount[];
  debtorClaimRecoveryBalance: number;
}
