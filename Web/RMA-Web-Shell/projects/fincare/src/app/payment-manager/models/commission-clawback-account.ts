import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { CommissionClawBackAccountMovement } from './commission-clawback-account-movement';

export class CommissionClawBackAccount extends BaseClass {
    ClawBackAccountId: number;
    recepientTypeId: number;
    recepientId: number;
    recepientCode: string;
    recepientName: string;
    accountBalance: number;
    headerStatusId: number;
    clawBackAccountMovements: CommissionClawBackAccountMovement[];
}
