namespace RMA.Service.ClientCare.Contracts.Entities.Dashboard
{
    public class Dashboard
    {
        public int? Count { get; set; }
        public decimal? Premium { get; set; }

        public string Name { get; set; }
        public string Product { get; set; }
        public string Industry { get; set; }
        public string Reason { get; set; }
        public string Month { get; set; }

        public int? NumberOfPolicies { get; set; }
        public int? NumberOfPoliciesCancelled { get; set; }
        public int? NumberOfLives { get; set; }
        public int? NumberOfLivesCancelled { get; set; }
        public int? NumberOfMembers { get; set; }

        public decimal? TotalInvoiceAmount { get; set; }
        public decimal? TotalInvoiceAmountPaid { get; set; }
        public decimal? TotalInvoiceAmountPartiallyPaid { get; set; }
        public decimal? InvoicePaid { get; set; }

        public string ROEStatus { get; set; }
        public decimal? NotPaid { get; set; }
        public decimal? Paid { get; set; }
        public decimal? ShortPaid { get; set; }
        public decimal? Total { get; set; }
        public decimal? PremiumAPI { get; set; }

        public decimal? InvoicedRaised { get; set; }
        public decimal? Payments { get; set; }
        public decimal? CancelledAmount { get; set; }

        public int? NumberOfLeads { get; set; }
        public string LeadStatus { get; set; }



        public Lead.Lead LeadSingle { get; set; }

        public string QuoteStatus { get; set; }
        public int? NumberOfQuotes { get; set; }
        public int? ZeroToThirtyDays { get; set; }
        public int? ThirtyToSixtyDays { get; set; }
        public int? OverSixtyDays { get; set; }

        public const string AgeAnalysisZeroToThirtyDays = "0 To 30 Days";
        public const string AgeAnalysisThirtyToSixtyDays = "30 To 60 Days";
        public const string AgeAnalysisOverSixtyDays = "Over 60 Days";
    }
}