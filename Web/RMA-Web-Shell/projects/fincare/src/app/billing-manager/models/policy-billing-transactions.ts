import { PolicyPaymentAllocation } from "./policy-payment-allocation";

export class PolicyBillingTransaction{

  policyId: number;
  policyNumber: string;
  paymentAllocations: PolicyPaymentAllocation[] = [];
  billingAmount: number;
  billingDate: Date;
  allocatedAmount: number;
  documentNumber: string;

}