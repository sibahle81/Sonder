import { TermArrangementScheduleStatusEnum } from 'projects/shared-models-lib/src/lib/enums/term-arrangement-schedule-status';
import { AdhocPaymentInstructionsTermArrangementSchedule } from './adhoc-payment-instructions-termArrangement-schedule';

export class TermArrangementSchedule {
    termArrangementScheduleId: number;
    termArrangementId: number;
    amount: number;
    termArrangementScheduleStatus: TermArrangementScheduleStatusEnum;
    isDeleted: Date;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    paymentDate: Date;
    balance: number;
    adhocPaymentInstructionsTermArrangementSchedules: AdhocPaymentInstructionsTermArrangementSchedule[]
    isCollectionDisabled: boolean;
    collectBalance: boolean;

     public static copy(termArrangementSchedule: TermArrangementSchedule): TermArrangementSchedule
    {
      let newTermArrangementSchedule =  new TermArrangementSchedule();
      newTermArrangementSchedule.amount = termArrangementSchedule.amount;
      newTermArrangementSchedule.termArrangementScheduleStatus = termArrangementSchedule.termArrangementScheduleStatus;
      newTermArrangementSchedule.isDeleted = termArrangementSchedule.isDeleted;
      newTermArrangementSchedule.paymentDate = termArrangementSchedule.paymentDate;
      newTermArrangementSchedule.balance = termArrangementSchedule.balance;
      newTermArrangementSchedule.isCollectionDisabled = termArrangementSchedule.isCollectionDisabled;
      newTermArrangementSchedule.collectBalance = termArrangementSchedule.collectBalance;
      return newTermArrangementSchedule;
    }   
}
