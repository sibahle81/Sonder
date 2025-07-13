export class RefundStatementModel
{
    transactionId:number;
    invoiceId: number; 
    policyId: number;
    transactionDate: Date;
    transactionType: string;
    documentNumber: string;
    reference: string;
    description: string;
    debitAmount: number;
    creditAmount: number;
    balance: number;
    runningBalance: number;
    amount: number;
}
