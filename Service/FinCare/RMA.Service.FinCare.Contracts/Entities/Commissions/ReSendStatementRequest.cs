namespace RMA.Service.FinCare.Contracts.Entities.Commissions
{
    public class ReSendStatementRequest
    {
        public int AccountTypeId { get; set; }
        public int AccountId { get; set; }
        public int PeriodId { get; set; }
    }
}
