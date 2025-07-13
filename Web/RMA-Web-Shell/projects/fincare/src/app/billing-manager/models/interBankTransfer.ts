import { TransactionTypeEnum } from '../../shared/enum/transactionTypeEnum';
import { InterBankTransferDetail } from './inter-bank-transfer-detail';
import { InterDebtorTransfer } from './interDebtorTransfer';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';

export class InterBankTransfer {
  interBankTransferId: number;
  fromTransactionId: number;
  toTransactionId: number;
  toRmaBankAccountId: number;
  toAccountNumber: string;
  fromRmaBankAccountId: number;
  fromAccountNumber: string;
  originalAmount: number;
  transferAmount: number;
  receiverDebtorNumber: string;
  transactionType: TransactionTypeEnum;
  fromTransactionReference: string;
  toTransactionReference: string;
  interDebtorTransfer: InterDebtorTransfer;
  interBankTransferNotes: Note[];
  periodStatus: PeriodStatusEnum;
  requestCode: string;
  interBankTransferDetails: InterBankTransferDetail[];
  fromRolePlayerId?: number;
  toRolePlayerId?: number;
}

