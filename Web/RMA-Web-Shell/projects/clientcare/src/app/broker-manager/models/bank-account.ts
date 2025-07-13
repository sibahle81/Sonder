export class BankAccount {
    id: number;
    createdBy: string;
    modifiedBy: string;
    createdDate: Date;
    modifiedDate: Date;
    isDeleted: boolean;

    clientId: number;
    branchId: number;
    groupId: number;
    bankBranchId: number;
    bankId: number;
    departmentId: number;
    accountNumber: string;
    name: string;
    linkedId: number;
    linkedClientName: string;
    bankName: string;
    bank: string;
    branchNumber: string;
    clientName: string;
    itemType: string;
    itemId: number;
    accountName: string;
    accountHolderName: string;
    paymentMethodId: number;
    accountTypeId: number;
    universalBranchCode: string;
    bankAccountServiceTypes: string;
    bankAccountServiceTypeIds: number[] = [];
    verifyBankAccount: boolean;
    beneficiaryTypeId: number;
    payFromAccountId: number;
    isApproved: boolean;
    reason: string;
    approvalRequestedFor: string;
    approvalRequestId: number;
}
