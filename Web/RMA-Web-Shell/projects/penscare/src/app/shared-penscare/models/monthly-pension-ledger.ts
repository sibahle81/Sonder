import { BatchStatusEnum } from "projects/shared-models-lib/src/lib/enums/batch-status-enum";
import { MonthlyPensionChangeReasonEnum } from "projects/shared-models-lib/src/lib/enums/month-pension-change-reason-enum";
import { PaymentStatusEnum } from "projects/shared-models-lib/src/lib/enums/payment-status-enum";

export class MonthlyPensionLedger {
  recipientName: string;
  recipientSurname: string;
  monthlyPensionId;
  pensionLedgerId;
  amount: number;
  batchStatus: BatchStatusEnum;
  vat: number;
  paye: number;
  changeReason: MonthlyPensionChangeReasonEnum;
  additionalTax: number;
  paymentStatus: PaymentStatusEnum;
}
