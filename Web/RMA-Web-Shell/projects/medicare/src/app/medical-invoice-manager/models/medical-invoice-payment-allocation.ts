import { PaymentAllocationStatusEnum } from "projects/fincare/src/app/shared/enum/payment-allocation-status-enum";
import { PaymentTypeEnum } from "projects/shared-models-lib/src/lib/enums/payment-type-enum";

export class MedicalInvoicePaymentAllocation {
    allocationId: number;
    payeeId: number;
    paymentAllocationStatus: PaymentAllocationStatusEnum;
    medicalInvoiceId: number | null;
    daysOffInvoiceId: number | null;
    pdAwardId: number | null;
    assessedAmount: number;
    assessedVat: number;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: string;
    modifiedBy: string;
    modifiedDate: string;
    paymentType: PaymentTypeEnum | null;
}
