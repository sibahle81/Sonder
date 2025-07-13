import { CategoryInsuredEnum } from "../../policy-manager/shared/enums/categoryInsuredEnum";

export class QuoteDetailsV2 {
  quoteDetailId: number;
  quoteId: number;
  productOptionId: number;
  categoryInsured: CategoryInsuredEnum;
  industryRate: number;
  averageNumberOfEmployees: number;
  averageEmployeeEarnings: number;
  premium: number;
  parentChildSplitPercentage: number;
  liveInAllowance: number;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}
