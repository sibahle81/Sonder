import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";
import { IncreaseTypeEnum } from "../lib/enums/increase-type-enum";
import { LegislativeValueEnum } from "../lib/enums/legislative-value-enum";
import { PensIncreaseStatusEnum } from "../lib/enums/pension-increase-status-enum";

export class PensIncreaseResponse extends BaseClass {
  gazetteId: number;
  legislativeValue: LegislativeValueEnum;
  increaseType: IncreaseTypeEnum;
  pensionIncreaseStatus: PensIncreaseStatusEnum;
  benefitNames: string[];
  percentage: number;
  amount: number;
  fromAccidentDate: Date;
  toAccidentDate: Date;
  effectiveDate: Date;
  description: string;
}
