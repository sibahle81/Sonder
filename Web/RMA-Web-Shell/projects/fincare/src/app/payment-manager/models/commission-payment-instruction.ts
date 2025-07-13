import { CommissionPaymentTypeEnum } from '../../shared/enum/commission-payment-type.enum';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { HeaderStatusEnum } from '../../shared/enum/header-status.enum';

export class CommissionPaymentInstruction extends BaseClass {
    paymentInstructionId: number;
    headerId: number;
    commissionPaymentType: CommissionPaymentTypeEnum;
    amount: number;
    status: HeaderStatusEnum;
    results: string; 
}
