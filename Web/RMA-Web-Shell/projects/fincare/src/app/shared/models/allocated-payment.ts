
export class AllocatedPayment {
  debtorPaymentId: number;
  bankStatementEntryId: number;
  debtorName: string;
  invoiceNumber: string;
  policyNumber: string;
  userReference: string;
  transactionDate: Date;
  statementDate: Date;
  hyphenDateProcessed: Date;
  hyphenDateReceived: Date;
  amount: number;
  bankAccountNumber: number;
  userReference1: string;
  userReference2: string;
  transactionType: string;
  schemeName: string;
  brokerName: string;
  policyStatus: string;
  clientType: string;
  allocationDate: Date;
  isExpanded?: boolean;
  debtorNumber: string;
  productCategory: string;
}
