import { AllowanceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/allowance-type-enum';

export class DeclarationAllowance {
  declarationAllowanceId: number;
  declarationId: number;
  allowanceType: AllowanceTypeEnum;
  allowance: number;
}

