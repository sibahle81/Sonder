import { BankAccountTypeEnum } from "../enums/bank-account-type-enum";

export class RolePlayerBankingDetail {
  rolePlayerId: number;
  purposeId: number;
  effectiveDate: Date;
  accountNumber: string;
  bankBranchId: number;
  bankAccountType: BankAccountTypeEnum;
  accountHolderName: string;
  initials: string;
  accountHolderIdNumber: string;
  branchCode: string;
  approvalRequestedFor: string;
  approvalRequestId: number;
  isApproved?: boolean;
  reason: string;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  
  rolePlayerBankingId: number;
  bankName: string;

  accountHolderSurname: string;
  bankId: number;
  account: string;
  statusText: string;
  accountHolder: string;
  idNumber: string;
}
