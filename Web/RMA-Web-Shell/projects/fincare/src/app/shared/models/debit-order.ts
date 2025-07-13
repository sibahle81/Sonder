
export class DebitOrder {
    controlNumber: string;
    controlName: string;
    year: number;
    period: number;
    debitOrderDay: number;
    accountNumber: string;
    debtorName: string;
    invoiceId: number;
    invoiceNumber: string;
    policyId: number;
    policyNumber: string;
    debitOrdeAmount: number;
    clientBankAccountNumber: string;
    bankAccountType: string;
    branchCode: string;
    bankAccountNumber: string;
    actionDate: Date;
    message: string;
    rMACode: string;
    rMAMessage: string;
    hyphenDate: Date;
    errorCode: string;
    hyphenErrorMessage: string;
    bankDate: Date;
    bankErrorCode: string;
    bankErrorMessage: string;
    collectionStatus: string;
    decemberDebitDay: Date;
    balance: number;
    hyphenErrorCode: string;
    isExpanded?: boolean;
}
