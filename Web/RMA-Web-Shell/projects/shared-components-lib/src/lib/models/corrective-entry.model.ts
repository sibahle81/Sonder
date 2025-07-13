import { EntryChangeReasonEnum } from "projects/shared-models-lib/src/lib/enums/entry-change-reason-enum";
import { EntryStatusEnum } from "projects/shared-models-lib/src/lib/enums/entry-status-enum";
import { EntryTypeEnum } from "projects/shared-models-lib/src/lib/enums/entry-type-enum";
import { ScheduleTypeEnum } from "projects/shared-models-lib/src/lib/enums/schedule-type-enum";
import { CorrectiveEntrySplit } from "./corrective-entry-split.model";
import { PensionLedger } from "./pension-ledger.model";

export class CorrectiveEntry {
  pensionCaseNumber: string;
  entryType: EntryTypeEnum;
  scheduleType: ScheduleTypeEnum;
  recipientFirstName: string;
  recipientSurname: string;
  recipientId: number;
  beneficiaryFirstName: string;
  beneficiarySurname: string;
  beneficiaryId: number;
  id: number;
  amount: number;
  updatedBy: string;
  entryDate: Date;
  entryStatus: EntryStatusEnum;
  pensionLedgerId: number;
  entryChangeReason: EntryChangeReasonEnum;
  payeAmount: number;
  normalMonthlyPension: number;
  currentMonthlyPension: number;
  paymentDate: Date
}
