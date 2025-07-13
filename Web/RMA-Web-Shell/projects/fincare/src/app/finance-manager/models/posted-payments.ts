import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class PostedPayments extends BaseClass {
    paymentId: number;
    PayeeDetails: string;
    Bank: string;
    AccountDetails: string;
    BankBranch: string;
    Amount: number;
    PaymentDate: Date;
    reference: string;
    PaymentType: string;
}
