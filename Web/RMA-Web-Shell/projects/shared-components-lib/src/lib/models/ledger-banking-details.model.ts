import { BankAccountTypeEnum } from "projects/shared-models-lib/src/lib/enums/bank-account-type-enum";

export class LedgerBankingDetail {
  ledgerId?: number;
  pensionCaseNumber?: string;
  accountHolderName?: string;
  accountHolderSurname?: string;
  bankId?: number;
  account?: string;
  branchCode?: string;
  accountType?: BankAccountTypeEnum;
  rolePlayerId?: string;
  purposeId?: number;
  effectiveDate?: Date;
  accountNumber?: string;
  bankBranchId?: number;
  approvalRequestedFor?: string;
  approvalRequestId?: number;
  isApproved?: boolean;
  reason?: string;
  statusText?: string;
  rolePlayerBankingId?: number;
  bankName?: string;
  accountHolder?: string;
  idNumber?: string;
}
