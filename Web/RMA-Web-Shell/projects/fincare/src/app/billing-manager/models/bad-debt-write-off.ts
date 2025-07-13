import { TransactionTypeEnum } from "../../shared/enum/transactionTypeEnum";

export class BadDebtWriteOff {
    amount: number;    
    transactionType: TransactionTypeEnum;
    transactionId:number;
    invoiceId:number;
    documentNumber:string;
    description: string;
    productId: number;
  }