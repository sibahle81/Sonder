import { RecoveryReceiptDeductionTypeEnum } from "../../shared/enum/recovery-receipt-deduction-type-enum";
import { Payment } from "../../shared/models/payment.model";

export class RecoveryReceiptDeduction {
        recoveryReceiptDeductionId: number;
        recoveryReceiptId: number;
        recoveryReceiptDeductionType: RecoveryReceiptDeductionTypeEnum;
        description: string;
        payeeId: number;
        amount: number;
        paymentId: number;

        isDeleted: boolean;
        modifiedBy: string;
        modifiedDate: Date;
        createdBy: string;
        createdDate: Date;

        payment: Payment;
}