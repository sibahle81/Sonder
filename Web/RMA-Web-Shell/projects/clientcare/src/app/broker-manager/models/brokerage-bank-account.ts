import { BankAccountVerificationFeedbackEnum } from 'projects/shared-models-lib/src/lib/enums/bank-verification-status';

export class BrokerageBankAccount {
  id: number;
  brokerageId: number;
  effectiveDate: Date;
  accountNumber: string;
  bankBranchId: number;
  bankAccountType: number;
  accountHolderName: string;
  branchCode: string;
  approvalRequestedFor: string;
  approvalRequestId: number;
  isApproved: boolean;
  reason: string;
  statusText: string;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  bankAccountVerificationFeedback: BankAccountVerificationFeedbackEnum | null | undefined;  
}
