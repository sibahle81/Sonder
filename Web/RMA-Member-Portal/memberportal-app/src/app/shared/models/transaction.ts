import { TransactionTypeEnum } from '../enums/transactionTypeEnum';
import { Invoice } from './invoice';
import { TransactionTypeLink } from './transactionTypeLink';


export class Transaction {
  transactionId: number;
  invoiceId: number;
  rolePlayerId: number;
  transactionTypeLinkId: number;
  amount: number;
  amountAllocated: number;
  transactionDate: Date;
  bankReference: string;
  invoice: Invoice;
  transactionTypeLink: TransactionTypeLink;
  transactionType: TransactionTypeEnum;
  rmaReference: string;
  unallocatedAmount: number;
  reason: number;
  selected: boolean;
  transferAmount: number;
  reallocatedAmount: number;
  originalUnallocatedAmount: number;
  balance: number;
  refundAmount: number;
}
