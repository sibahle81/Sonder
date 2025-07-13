export class Dashboard {
  numberOfMembers: number;
  count: number;
  premium: number;

  name: string;
  product: string;
  industry: string;
  reason: string;

  numberOfPolicies: number;
  numberOfLives: number;
  totalInvoiceAmount: number;
  totalInvoiceAmountPaid: number;
  totalInvoiceAmountPartiallyPaid: number;
  invoicePaid: number;

  roeStatus: string;
  notPaid: number;
  paid: number;
  shortPaid: number;
  total: number;
  premiumAPI: number;

  numberOfPoliciesCancelled: number;
  numberOfLivesCancelled: number;
  month: string;
  invoicedRaised: number;
  payments: number;
  cancelledAmount: number;

  leadStatus: string;
  numberOfLeads: number;
  quoteStatus: string;
  numberOfQuotes: number;
  zeroToThirtyDays: number;
  thirtyToSixtyDays: number;
  overSixtyDays: number;
}
