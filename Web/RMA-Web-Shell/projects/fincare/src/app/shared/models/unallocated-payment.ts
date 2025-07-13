
export class UnallocatedPayment {
    unallocatedPaymentId: number;
    bankStatementEntryId: number;
    userReference: string;
    transactionDate: Date;
    statementDate:Date;
    hyphenDateProcessed:Date;
    hyphenDateReceived:Date;
    amount:number;
    originalAmount:number;
    status:string;
    bankAccountNumber:string;
    userReference1:string;
    userReference2:string;
    transactionType:string;
    statementReference: string;
    controlNumber: string;
    controlName: string;
    branchNumber: number;
    branchName: string;
}
