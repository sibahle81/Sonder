import { PensionTypeEnum } from "../enums/pension-type-enum";
import { PensionCaseStatusEnum } from "../enums/pensioncase-status-enum";

export class PensionCaseModel {
  pensionCaseId: number;
  pensionCaseStatus: PensionCaseStatusEnum;
  pensionCaseNumber: string;
  pensionType: PensionTypeEnum;
  modifiedDate: Date;
  pensionerName: string;
}
