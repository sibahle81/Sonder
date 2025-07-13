
import { IncreaseTypeEnum } from "../../annual-increase/lib/enums/increase-type-enum";
import { PensionLedgerPaymentEnum } from "../enums/pension-ledger-payment-status";

export class MonthEndRunPensionCaseLedger {
  monthlyPensionLedgerId: number;
  pensionAmount: number;
  claimReferenceNumber: string;
  beneficiaryName: string;
  paye?: number;
  additionalTax?: number;
  pensionIncreaseId?: number;
  pensionIncreaseType?: IncreaseTypeEnum;
  pensionLedgerPaymentStatus: PensionLedgerPaymentEnum;
}
