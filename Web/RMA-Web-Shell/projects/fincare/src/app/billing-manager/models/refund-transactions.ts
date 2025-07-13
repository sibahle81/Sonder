import { TransactionTypeEnum } from '../../shared/enum/transactionTypeEnum';

export class RefundTransaction {
        transactionId: number;
        rolePlayerId: number;
        amount: number;
        transactionDate: Date;
        bankReference: string;
        transactionType: TransactionTypeEnum;
        rmaReference: string;
        balance: number;
        refundAmount: number;
      }
