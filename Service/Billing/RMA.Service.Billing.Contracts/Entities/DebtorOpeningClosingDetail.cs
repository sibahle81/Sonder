namespace RMA.Service.Billing.Contracts
{
    public class DebtorOpeningClosingDetail
    {
        public int PolicyId { get; set; }
        public decimal OpeningBalance { get; set; }
        public decimal ClosingBalance { get; set; }
    }
}
