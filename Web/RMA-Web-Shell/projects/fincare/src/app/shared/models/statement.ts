import { InvoiceAllocation } from './invoice-allocation';
import { Transaction } from '../../billing-manager/models/transaction';

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
    period:string;
    policyNumber:string;
    debtorNetBalance: number;
    documentDate: Date;
    productId: number;
    periodId: number;
    TransactionReasonId: number;
}
