import { CategoryInsuredEnum } from "../enums/categoryInsuredEnum";

export class CategoryInsuredCover {
  coverId: number;
  policyId: number;
  categoryInsured: CategoryInsuredEnum;
  effectiveFrom: Date;
  effectiveTo: Date;

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}
