using System;

namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class RefundSummaryDetail
    {
        public DateTime CreatedDate { get; set; }
        public string FinpayeNumber { get; set; }
        public string Reason { get; set; }
        public DateTime? SubmissionDate { get; set; }
        public DateTime? PaymentConfirmationDate { get; set; }
        public string Name { get; set; }
        public decimal HeaderTotalAmount { get; set; }
    }
}
