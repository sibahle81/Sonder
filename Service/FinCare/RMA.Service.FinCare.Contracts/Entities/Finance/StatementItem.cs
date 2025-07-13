using System;

namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class StatementItem
    {
        public DateTime? documentDate { get; set; }
        public DateTime? paymentDate { get; set; }
        public DateTime? date { get; set; }
        public int typeId { get; set; }
        public string type { get; set; }
        public string document { get; set; }
        public string reference { get; set; }
        public string description { get; set; }
        public decimal debitAmount { get; set; }
        public decimal creditAmount { get; set; }
        public decimal? balance { get; set; }
        public decimal? lineBalance { get; set; }
        public int paymentHeaderId { get; set; }
        public int clientCoverId { get; set; }
        public int paymentHeaderDetailId { get; set; }
        public string policyNumber { get; set; }
    }
}
