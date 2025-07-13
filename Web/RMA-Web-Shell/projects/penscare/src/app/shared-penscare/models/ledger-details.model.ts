import { FamilyUnit } from 'projects/shared-components-lib/src/lib/pension-ledger/family-unit.model';
import { PensionLedgerTransaction } from 'projects/shared-components-lib/src/lib/pension-ledger/pension-ledger-transaction.model';

export class LedgerDetails {
  id: number;
  pensionCaseId: number;
  pensionCaseNumber: string;
  familyUnits: FamilyUnit[] = [];
}
