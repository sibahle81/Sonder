namespace RMA.Service.FinCare.Contracts.Entities.Payments
{
    public class GetRemittanceTransactionsListRequest
    {
        public string StartDate { get; set; }
        public string EndDate { get; set; }
    }
}
