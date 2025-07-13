import { RolePlayerPolicyDeclarationStatusEnum } from "../enums/role-player-policy-declaration-status.enum";
import { RolePlayerPolicyDeclarationTypeEnum } from "../enums/role-player-policy-declaration-type.enum";
import { RolePlayerPolicyDeclarationDetail } from "./role-player-policy-declaration-detail";
import { RolePlayerPolicyTransaction } from "./role-player-policy-transaction";

export class RolePlayerPolicyDeclaration {
  rolePlayerPolicyDeclarationId: number;
  tenantId: number;
  rolePlayerId: number;
  policyId: number;
  rolePlayerPolicyDeclarationStatus: RolePlayerPolicyDeclarationStatusEnum;
  rolePlayerPolicyDeclarationType: RolePlayerPolicyDeclarationTypeEnum;
  productId: number;
  declarationYear: number;
  penaltyPercentage: number;
  totalPremium: number;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  variancePercentage: number;
  varianceReason: string;
  allRequiredDocumentsUploaded: boolean;

  rolePlayerPolicyDeclarationDetails: RolePlayerPolicyDeclarationDetail[];

  rolePlayerPolicyTransactions: RolePlayerPolicyTransaction[];
  prorataDays: number;
  fullYearDays: number;
  invoiceAmount: number;
  originalTotalPremium: number;
  originalEarningsPerEmployee: number;
  adjustmentAmount: number;
  requiresTransactionModification: boolean;
  isReinstate: boolean;

  effectiveFrom: Date;
  effectiveTo: Date;
}

