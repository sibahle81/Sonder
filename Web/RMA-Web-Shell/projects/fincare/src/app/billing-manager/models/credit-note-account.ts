import { Transaction } from './transaction';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';

export class CreditNoteAccount {
  rolePlayerId: number;
  finPayeNumber: string;
  isAuthorised: Date;
  authorisedBy: string;
  authorisedDate: Date;
  transactions: Transaction[];
  note: Note;
  amount: number;
  periodStatus: PeriodStatusEnum;
}
