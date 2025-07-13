import { CategoryInsuredEnum } from "../enums/categoryInsuredEnum";

export class RolePlayerPolicyDeclarationDetail {
  rolePlayerPolicyDeclarationDetailId: number;
  rolePlayerPolicyDeclarationId: number;
  productOptionId: number;
  categoryInsured: CategoryInsuredEnum
  rate: number;
  averageNumberOfEmployees: number;
  averageEmployeeEarnings: number;
  originalPremium: number;
  premium: number;
  liveInAllowance: number;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  effectiveFrom: Date;
  effectiveTo: Date;
}

