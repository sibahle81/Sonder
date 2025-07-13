import { Transaction } from './transaction';
import { DocumentsRequest } from 'projects/shared-components-lib/src/lib/document-management/documents-request';
import { FinPayee } from '../../shared/models/finpayee';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';

export class CreditNoteReversal {
  debtorAccount: FinPayee;
  rolePlayerId: number;
  finPayeNumber: string;
  isAuthorised: Date;
  authorisedBy: string;
  authorisedDate: Date;
  transactions: Transaction[];
  notes: Note[];
  amount: number;
  documents: DocumentsRequest[];
  requestCode: string;
  periodStatus: PeriodStatusEnum;
}
