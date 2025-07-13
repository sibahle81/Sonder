import { TransactionTypeEnum } from '../enum/transactionTypeEnum';

export class TransactionSearchRequest {
    policyId: number;
    startDate: string;
    endDate: string;
    transactionType: TransactionTypeEnum = TransactionTypeEnum.All;
    query = '';
  }
