import { CommissionDetail } from './commission-detail';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { CommissionActionEnum } from '../../shared/enum/commission-action.enum';
import { CommissionPaymentInstruction } from './commission-payment-instruction';

export class CommissionHeader extends BaseClass {
    headerId: number;
    periodId: number;
    recepientCode: string;
    recepientTypeId: number;
    recepientId: number;
    totalHeaderAmount: number;
    headerStatusId: number;   
    recepientName: string;
    comment: string;
    details:CommissionDetail[];
    action:CommissionActionEnum;
    periodMonth:number;
    periodYear:number;
    isFitAndProper:boolean;
    fitAndProperCheckDate:Date;
    paymentInstructions:CommissionPaymentInstruction[];
    withholdingReasonId:number;
    assignedTo?: number;
    userName: string;
    userId?: number;
}