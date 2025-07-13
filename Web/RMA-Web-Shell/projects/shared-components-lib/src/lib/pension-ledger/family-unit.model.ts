import { MonthlyPension } from './monthly-pension.model';
import { PensionLedgerTransaction } from './pension-ledger-transaction.model';
import { Person } from '../models/person.model';

export class FamilyUnit {
  normalMonthlyPension: MonthlyPension;
  currentMonthlyPension: MonthlyPension;
  recipients: Person[] = [];
  beneficiaries: Person[] = [];
  transactions: PensionLedgerTransaction[] = [];
}
