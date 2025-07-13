import { IncreaseTypeEnum } from "../lib/enums/increase-type-enum";
import { LegislativeValueEnum } from "../lib/enums/legislative-value-enum";
import { PensIncreaseStatusEnum } from "../lib/enums/pension-increase-status-enum";
import {IncreaseAmountType} from '../lib/enums/amount-type-enum';


export class AnnualIncreaseNotification {
  gazetteId?: number;
  legislativeValue?: LegislativeValueEnum;
  increaseType?: IncreaseTypeEnum;
  pensionIncreaseAmountType?: IncreaseAmountType;
  pensionIncreaseStatus?: PensIncreaseStatusEnum;
  benefitNames?: string[] = null;
  percentage?: number;
  amount?: number;
  fromAccidentDate?: Date;
  toAccidentDate?: Date;
  effectiveDate?: Date;
  description?: string;

  constructor() {};
}
