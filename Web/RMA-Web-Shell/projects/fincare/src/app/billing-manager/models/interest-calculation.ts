import { TransactionTypeEnum } from '../../shared/enum/transactionTypeEnum';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';

export class InterestCalculation {
  interestCalculationId: number;
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
  interestTransferNotes: Note[];
  periodStatus: PeriodStatusEnum;
  requestCode: string;
}

