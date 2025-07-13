import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';

export class RolePlayerBankingDetail extends BaseClass {
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
    isForeign: boolean;

    accountHolderSurname: string;
    bankId: number;
    account: string;
    statusText: string;
    accountHolder: string;
    idNumber: string;
}
