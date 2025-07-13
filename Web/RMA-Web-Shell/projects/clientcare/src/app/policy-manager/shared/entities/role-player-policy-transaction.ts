import { TransactionTypeEnum } from "projects/fincare/src/app/shared/enum/transactionTypeEnum";
import { RolePlayerPolicyTransactionStatusEnum } from "../enums/role-player-policy-transaction-status.enum";
import { SourceProcessEnum } from "projects/shared-models-lib/src/lib/enums/source-enums";
import { RolePlayerPolicyTransactionDetail } from "./role-player-policy-transaction-detail";

export class RolePlayerPolicyTransaction {
  rolePlayerPolicyTransactionId: number;
  tenantId: number;
  rolePlayerId: number;
  policyId: number;
  coverPeriod: number;
  transactionType: TransactionTypeEnum;
  documentNumber: string;
  totalAmount: number;
  effectiveDate: Date;
  sentDate: Date;
  rolePlayerPolicyTransactionStatus: RolePlayerPolicyTransactionStatusEnum;
  sourceProcess: SourceProcessEnum;
  documentDate: Date;

  rolePlayerPolicyTransactionDetails: RolePlayerPolicyTransactionDetail[];
  
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

