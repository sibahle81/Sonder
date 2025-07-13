import { CorrectiveEntrySplit } from "./corrective-entry-split.model";
import { CorrectiveEntry } from "./corrective-entry.model";
import { PensionLedger } from "./pension-ledger.model";

export class CorrectiveEntryNotification {
  action: string;
  correctiveEntry?: CorrectiveEntry;
  ledger?: PensionLedger;
  correctiveEntrySplit? : CorrectiveEntrySplit[];
}
