import { AllocationProgressionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/allocation-progression-status-enum';
import { Transaction } from './transaction';
import { InterDebtorTransferDetail} from './interDebtorTransferDetail';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';

export class InterDebtorTransfer {
  title: string;
  interDebtorTransferId: number;
  receiverAccountNumber: string;
  fromAccountNumber: string;
  transferAmount: number;
  fromDebtorNumber: string;
  receiverDebtorNumber: string;
  createdBy: string;
  modifiedBy: string;
  createdDate: Date;
  modifiedDate: Date;
  allocationProgressStatus: AllocationProgressionStatusEnum;
  InterBankTransferId: number;
  transactions: Transaction[];
  interDebtorTransferNotes: Note[];
  periodStatus: PeriodStatusEnum;
  receiverRolePlayerId: number;
  receiverHasInvoicesOutstanding: boolean;
  interDebtorTransferDetails: InterDebtorTransferDetail[];
}

