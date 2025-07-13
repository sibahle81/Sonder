import { RolePlayerPolicyDeclarationTypeEnum } from "../enums/role-player-policy-declaration-type.enum";
import { RolePlayerPolicyOnlineSubmissionDetail } from "./role-player-policy-online-submission-detail";

export class RolePlayerPolicyOnlineSubmission {
  rolePlayerPolicyOnlineSubmissionId: number;
  rolePlayerId: number;
  policyId: number;
  rolePlayerPolicyDeclarationType: RolePlayerPolicyDeclarationTypeEnum;
  productId: number;
  declarationYear: number;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;

  rolePlayerPolicyOnlineSubmissionDetails: RolePlayerPolicyOnlineSubmissionDetail[];
}

