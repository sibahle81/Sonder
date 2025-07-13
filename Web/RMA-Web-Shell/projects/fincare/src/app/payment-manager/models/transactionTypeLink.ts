import { Transaction } from './transaction';

export class TransactionTypeLink {
  id: number;
  name: string;
  isDebit: boolean;
  transactions: Transaction[];
}
