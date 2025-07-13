import { DeclarationRenewalStatusEnum } from "../enums/declaration-renewal-status.enum";
import { DeclarationStatusEnum } from "../enums/declaration-status.enum";
import { DeclarationTypeEnum } from "../enums/declaration-type.enum";
import { DeclarationAllowance } from "./declaration-allowance";
import { DeclarationBillingIntegration } from "./declaration-billing-integration";


export class Declaration {
  declarationId: number;
  declarationStatus: DeclarationStatusEnum;
  declarationType: DeclarationTypeEnum;
  rolePlayerId: number;
  averageEmployeeCount: number;
  averageEarnings: number;
  declarationYear: number;
  declarationRenewalStatus: DeclarationRenewalStatusEnum;
  comment: string;
  rate: number;
  premium: number;
  penaltyPercentage: number;
  penaltyRate: number;
  penaltyPremium: number;
  adjustment: number;
  productOptionId: number;
  declarationAllowances: DeclarationAllowance[] = [];
  variancePercentage: number;
  dependentDeclarations: Declaration[];
  declarationBillingIntegrations: DeclarationBillingIntegration[];

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;

}

