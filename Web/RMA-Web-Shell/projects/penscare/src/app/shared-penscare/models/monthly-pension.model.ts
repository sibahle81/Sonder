import { BatchStatusEnum } from "projects/shared-models-lib/src/lib/enums/batch-status-enum";

export class MonthlyPension {
  monthlyPensionId: number;
  paymentDate: Date;
  totalAmount: number;
  releasedAmount:  number;
  batchStatus: BatchStatusEnum;
}
