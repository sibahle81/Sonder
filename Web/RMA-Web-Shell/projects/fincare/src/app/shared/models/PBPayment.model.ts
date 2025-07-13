import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";

export class PBPayment extends BaseClass {
    reference: string;
    policyNumber: string;
    amount: number;
    PaymentId: number;
    RolePlayerIdentificationTypeId: number;
}
