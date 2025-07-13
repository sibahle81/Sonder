import { Statement } from "../../shared/models/statement";

export class InterestAdjustment {
    transactionId: number;
     adjustmentAmount :number; 
     roleplayerId :number; 
     isUpwardAdjustment :boolean
     transaction: Statement;
     finPayee: string;
  }
  