import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { CommissionPaymentTypeEnum } from '../../shared/enum/commission-payment-type.enum';

export class CommissionClawBackAccountMovement extends BaseClass {
    clawBackAccountMovementId: number;
    clawBackAccountId: number;
    headerId: number;
    commissionPaymentType: CommissionPaymentTypeEnum;
    totalDueAmount: number;
    currentClawBackBalance: number;
    newClawBackBalance: number;
}
