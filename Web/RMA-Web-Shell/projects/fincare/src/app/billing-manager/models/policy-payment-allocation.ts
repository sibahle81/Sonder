import { BillingAllocationTypeEnum } from "../../shared/enum/billing-allocation-type.enum";

export class PolicyPaymentAllocation{
    id: number;
    transactionId: number;
    policyId: number;
    billingMonth: Date;
    amount:number;
    createdDate: Date;
    createdBy: string;
    transactionTypeLinkId: number;
    billingAllocationType: BillingAllocationTypeEnum;
    linkedPolicyPaymentAllocationId: number;
    isDeleted: boolean;
}