import { AdhocPaymentInstruction } from "./adhoc-payment-instruction";

export class AdhocPaymentInstructionsTermArrangementSchedule {
  adhocPaymentInstructionsTermArrangementScheduleId: number;
  adhocPaymentInstructionId: number;
  termArrangementScheduleId: number;
  amount: number;
  isDeleted: boolean;
  isActive: boolean;
  createdBy: string;
  modifiedBy: string;
  createdDate: Date;
  modifiedDate: Date;
  adhocPaymentInstruction: AdhocPaymentInstruction
}
