import { InvoiceAllocation } from './invoice-allocation';
import { Transaction } from './transaction';

export class Statement {
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
    itemId: number;
    transactionId: number;
    invoiceAllocations: InvoiceAllocation[];
    linkedTransactions: Transaction[];
    statement: any;
}
