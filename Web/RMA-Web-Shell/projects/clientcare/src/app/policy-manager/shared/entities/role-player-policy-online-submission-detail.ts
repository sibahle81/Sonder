import { CategoryInsuredEnum } from "../enums/categoryInsuredEnum";

export class RolePlayerPolicyOnlineSubmissionDetail {
  rolePlayerPolicyOnlineSubmissionDetailId: number;
  rolePlayerPolicyOnlineSubmissionId: number;
  productOptionId: number;
  categoryInsured: CategoryInsuredEnum
  averageNumberOfEmployees: number;
  averageEmployeeEarnings: number;
  liveInAllowance: number;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

