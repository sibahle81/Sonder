import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';

export class TransactionsReversalRequest {
    transactionIds: number[];
    toRoleplayerId: number;
    periodStatus: PeriodStatusEnum;
  }

