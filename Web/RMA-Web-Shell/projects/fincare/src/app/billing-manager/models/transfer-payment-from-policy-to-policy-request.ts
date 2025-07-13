export class TransferPaymentFromPolicyToPolicyRequest
{
 fromPolicyId: number;
 toPolicyId: number;
 fromPolicyBillingMonth: Date;
 toPolicyBillingMonth: Date;
 amountToTransfer: number;
 rolePlayerId: number;
 notes: string;
 fromPaymentAllocationId: number;

}