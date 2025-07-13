import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { Statement } from '../../shared/models/statement';

export class InterestReversal {
  rolePlayerId: number;
  displayName: string;
  finPayeeNumber: string;
  transactions: Statement[];
  note: Note;
  selectedTransactionIds: number[];
}
