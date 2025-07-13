import { CategoryInsuredEnum } from "../enums/categoryInsuredEnum";

export class RolePlayerPolicyTransactionDetail {
  rolePlayerPolicyTransactionDetailId: number;
  rolePlayerPolicyTransactionId: number;
  productOptionId: number;
  
  categoryInsured: CategoryInsuredEnum
  rate: number;
  numberOfEmployees: number;
  totalEarnings: number;
  originalPremium: number;
  premium: number;
  liveInAllowance: number;
  effectiveFrom: Date;
  effectiveTo: Date;

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

