import { EarningsTypeEnum } from "projects/shared-models-lib/src/lib/enums/earnings-type-enum";
import { EarningDetail } from "./earning-detail-model";

export class Earning {
  earningId: number;
  personEventId: number;
  variableSubTotal: number | null;
  nonVariableSubTotal: number | null;
  total: number | null;
  isVerified: boolean;
  isEstimated: boolean;
  earningsType: EarningsTypeEnum;
  sec51EmpNo: string;
  sec51DateOfQualification: Date | null;
  sec51DateOfEngagement: Date | null;
  sec51DateOfBirth: Date | null;

  earningDetails: EarningDetail[];

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}
