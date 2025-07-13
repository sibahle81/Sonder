import { Bank } from './bank';

export class BankBranch {
  id: number;
  name: string;
  code: string;
  bankId: number;
  bank: Bank;
}
