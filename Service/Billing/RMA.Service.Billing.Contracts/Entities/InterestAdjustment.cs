namespace RMA.Service.Billing.Contracts.Entities
{
    public class InterestAdjustment
    {
        public int RoleplayerId { get; set; }
        public int TransactionId { get; set; }
        public decimal AdjustmentAmount { get; set; }
        public Statement Transaction { get; set; }
        public bool IsUpwardAdjustment { get; set; }
        public string FinPayee { get; set; }
    }
}
