import { AllowanceTypeEnum } from "../enums/allowance-type-enum";

export class DeclarationAllowance {
  declarationAllowanceId: number;
  declarationId: number;
  allowanceType: AllowanceTypeEnum;
  allowance: number;
}

