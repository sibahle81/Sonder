import { PeriodStatusEnum } from "projects/shared-models-lib/src/lib/enums/period-status-enum";
import { BadDebtReinstate } from "./bad-debt-reinstate";

export class BadDebtReinstateRequest {
    roleplayerId: number;
    badDebtReinstates: BadDebtReinstate[];
    reason: string;
    period: PeriodStatusEnum;
  }