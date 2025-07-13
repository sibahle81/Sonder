export class DebtorOpenTransactionsRequest {
    roleplayerId: number;
    transactionTypeId: number;
    policyIds: number[];
    transactionStartDate: Date;
    transactionEndDate: Date;
  }