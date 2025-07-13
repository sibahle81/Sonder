import { BankAccountTypeEnum } from "projects/shared-models-lib/src/lib/enums/bank-account-type-enum";
import { PremiumPaybackStatusEnum } from "../enums/premium-payback-status.enum";

export class PremiumPaybackItem {
    policyId: number;
    policyNumber: string;
    policyInceptionDate: Date;
    rolePlayerId: number;
    policyOwner: string;
    idNumber: string;
    mobileNumber: string;
    premiumPaybackId: number;
    paybackDate: Date;
    notificationDate: Date;
    premiumPaybackStatus: PremiumPaybackStatusEnum;
    paybackAmount: number;
    paybackFailedReason: string;
    rolePlayerBankingId: number;
    bankAccountType: BankAccountTypeEnum;
    accountNumber: string;
    bankId: number;
    bankBranchId: number;
    branchCode: string;
}