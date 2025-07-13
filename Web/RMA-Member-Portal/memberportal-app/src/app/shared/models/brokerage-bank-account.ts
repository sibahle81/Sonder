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
}
