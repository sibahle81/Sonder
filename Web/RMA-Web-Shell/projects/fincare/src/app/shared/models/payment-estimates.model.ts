import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class PaymentEstimate extends BaseClass {
    paymentType: string;
    amount: number;
    numberOfTransactions: number;
    time: string;
    senderAccountNumber:string;
    numberOfPayees: number;
}
