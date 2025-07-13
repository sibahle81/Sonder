import { PensionLedgerStatusEnum } from "projects/shared-models-lib/src/lib/enums/pension-ledger-status.enum"
import { PensCareNote } from "./penscare-note";

export class PensionLedgerStatusNotification {
  public status: PensionLedgerStatusEnum;
  public reason: number;
  public pensionLedgerId: number;
  public pensionCaseNumber: string;
  public beneficiarySurname: string;
  public notes: PensCareNote[];
}
