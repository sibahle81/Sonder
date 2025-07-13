import { AllowanceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/allowance-type-enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';

export class ProductOptionAllowanceType {
  productOptionAllowanceTypeId: number;
  productOptionId?: number;
  allowanceType?: AllowanceTypeEnum;
  industryClass?: IndustryClassEnum;
}
