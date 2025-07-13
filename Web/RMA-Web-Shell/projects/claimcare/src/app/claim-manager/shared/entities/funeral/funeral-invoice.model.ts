export class FuneralInvoice {
claimInvoiceId:  number; 
referenceNumber:  string; 
refundAmount:  number | null; 
outstandingPremiumAmount:  number | null; 
unclaimedPaymentInterest:  number | null; 
tracingFees: number | null; 
capAmount: number | null; 
coverAmount: number | null; 
claimInvoiceDecision: number; 
claimInvoiceDeclineReason: number ;
allocationPercentage: number | null; 
decisionNote: string; 
bankAccountId: number | null; 
}