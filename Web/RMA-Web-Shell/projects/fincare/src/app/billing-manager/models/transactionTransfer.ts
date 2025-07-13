import { FinPayee } from '../../shared/models/finpayee';
import { InvoiceAllocation } from '../../shared/models/invoice-allocation';
import { Transaction } from './transaction';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';

export class TransactionTransfer {
  fromDebtorAccount: FinPayee;
  transactions: Transaction[];
  toDebtorAccount: FinPayee;
  reason: string;
  requestCode: string;
  notes: Note[];
  invoiceAllocations: InvoiceAllocation[];
  fromPolicyIds: number[];
  toPolicyIds: number[];
  documentUniqueId: string;
}


