import { PeriodStatusEnum } from "projects/shared-models-lib/src/lib/enums/period-status-enum";
import { BadDebtWriteOff } from "./bad-debt-write-off";

export class BadDebtWriteOffRequest {
  roleplayerId: number;
  badDebtWriteOffs: BadDebtWriteOff[];
  reason: string;
  period: PeriodStatusEnum;
  amount: number;
}