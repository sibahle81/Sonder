import { AllowanceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/allowance-type-enum';

export class QuoteAllowance {
  quoteAllowanceId: number;
  quoteId: number;
  allowanceType: AllowanceTypeEnum;
  allowance: number;
}