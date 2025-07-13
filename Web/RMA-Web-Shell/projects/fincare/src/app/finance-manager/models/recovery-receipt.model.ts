import { RecoveryReceiptTypeEnum } from "../../shared/enum/recovery-receipt-type-enum";
import { RecoveryReceiptAllocation } from "./recovery-receipt-allocation.model";
import { RecoveryReceiptDeduction } from "./recovery-receipt-deduction.model";

export class RecoveryReceipt {
        recoveryReceiptId: number;
        recoveryReceiptType: RecoveryReceiptTypeEnum;
        recoveredByRolePlayerId: number;
        eventId: number;
        amount: number;

        isDeleted: boolean;
        modifiedBy: string;
        modifiedDate: Date;
        createdBy: string;
        createdDate: Date;

        recoveryReceiptAllocations: RecoveryReceiptAllocation[];
        recoveryReceiptDeductions: RecoveryReceiptDeduction[];
}