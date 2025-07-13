import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class PaymentDetails extends BaseClass {
    paymentId: number;
    paymentStatus: string;
    isReversal: boolean;
    payee: string;
    amount: number;
    dateAuthorised: string;
    datePaid: string;
    paymentStatusReason: string;
}