
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { CommissionDetail } from './commission-detail';
import { CommissionPaymentInstruction } from './commission-payment-instruction';
import { CommissionPeriod } from './commission-period';
export class CommissionAuditTrailModel extends BaseClass {
    details: CommissionDetail[];
    paymentInstructions: CommissionPaymentInstruction[];
    period: CommissionPeriod;
    headerId: number;
    periodId: number;
    recepientTypeId: number;
    recepientId: number;
    headerStatusId: number;
    recepientCode: string;
    recepientName: string;
    isFitAndProper: boolean;
    fitAndProperCheckDate: Date;
    totalHeaderAmount: number;
    reasons: string[];
}
