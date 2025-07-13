import { TransactionTypeEnum } from "../../shared/enum/transactionTypeEnum";

export class BadDebtReinstate {
    amount: number;    
    transactionType: TransactionTypeEnum;
    transactionId:number;
    invoiceId:number;
    documentNumber:string;
    description: string;
  }