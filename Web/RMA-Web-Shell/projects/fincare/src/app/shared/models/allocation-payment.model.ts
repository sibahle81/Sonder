import { PaymentTypeEnum } from "projects/shared-models-lib/src/lib/enums/payment-type-enum";
import { PaymentAllocationStatusEnum } from "../enum/payment-allocation-status-enum";
import { Payment } from "./payment.model";

export class AllocationPaymentModel {
    allocationId: number;
    payeeId: number;
    paymentAllocationStatus: PaymentAllocationStatusEnum;
    medicalInvoiceId: number | null;
    daysOffInvoiceId: number | null;
    commutationId: number | null;
    overPaymentId: number | null;
    monthlyPensionLedgerId: number | null;
    pdAwardId: number | null;
    assessedAmount: number;
    assessedVat: number;
    payment: Payment;
    paymentId: number | null;
    paymentType: PaymentTypeEnum | null;
}
