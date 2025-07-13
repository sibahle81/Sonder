namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class RefundSummary
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal Amount { get; set; }
        public string Reason { get; set; }
    }
}
