import { Invoice } from '../../shared/models/invoice';


import { DebitTransactionAllocation } from '../../shared/models/debit-transaction-allocation';
export class WriteOffBadDebt {
  debitAllocations: DebitTransactionAllocation[];
  transactionId: number;
  invoiceId: number;
  rolePlayerId: number;
  transactionTypeLinkId: number;
  amount: number;  
  amountAllocated: number;
  transactionDate: Date;
  bankReference: string;
  invoice: Invoice;
  rmaReference: string;
  unallocatedAmount: number;
  reason: number;
  selected: boolean;
  transferAmount: number;
  reallocatedAmount: number;
  originalUnallocatedAmount: number;
  balance: number;
  refundAmount: number;
  policyId: number;
  documentNumber: string;
  reference: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
 

}
