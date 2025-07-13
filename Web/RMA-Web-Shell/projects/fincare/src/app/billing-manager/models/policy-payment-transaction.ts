import { PolicyPaymentAllocation } from "./policy-payment-allocation";

export class PolicyPaymentTransaction{

policyNumber:string;
balance: number;
billingMonth: Date;
allocations: PolicyPaymentAllocation[] = []
}