import { DebtorStatusEnum } from "../../shared/enum/debtor-status.enum";

export class BulkWriteOffModel {
    public memberNumber: string;
    public memberName: string;
    public financialYear?: number;
    public underwritingYear?: number;
    public ageBalance?: number;
    public interestReversalReference: string;
    public interestReversalAmount?: number; 
    public premiumWriteOffReference: string;
    public premiumWriteOffAmount?: number;
    public reason: string;
    public debtorsClerk: string;
    public status?: DebtorStatusEnum;
  }