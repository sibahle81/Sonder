import { AllowanceTypeEnum } from "../enums/allowance-type-enum";

export class QuoteAllowance {
  quoteAllowanceId: number;
  quoteId: number;
  allowanceType: AllowanceTypeEnum;
  allowance: number;
}