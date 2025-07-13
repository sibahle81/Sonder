export class AdhocPaymentInstruction {
  adhocPaymentInstructionId: number;
  dateToPay: Date;
  adhocPaymentInstructionStatus: number;
  reason: string;
  rolePlayerId: number;
  rolePlayerName: string;
  amount: number;
  createdBy: string;
  modifiedBy: string;
  createdDate: Date;
  modifiedDate: Date;
  finPayeNumber: string;
  errorDescription: string;
  bankAccountEffectiveDate: Date;
  bankAccountNumber: string;
  bankAccountType: string;
  bankAccountHolder: string;
  bankBranchCode: string;
  bank: string;
  policyId?: number;
  policyNumber: string;
  targetedTermArrangementScheduleIds: number[];
  rolePlayerBankingId: number;
  tempDocumentKeyValue: string;
}
